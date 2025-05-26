import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { TennisAnalysisResponseDto } from './dto/tennis-analysis-response.dto';
import { TennisScoreService } from './tennis-score.service';
import { CreateTennisScoreDto } from './dto/tennis-score.dto';

@Injectable()
export class TennisAnalysisService {
  private readonly logger = new Logger(TennisAnalysisService.name);
  private readonly openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private tennisScoreService: TennisScoreService,
  ) {
    const apiKey = this.configService.get<string>('DASHSCOPE_API_KEY');
    if (!apiKey) {
      throw new Error('DASHSCOPE_API_KEY environment variable is required');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    });
  }

  async analyzeVideo(videoUrl: string, userId?: string): Promise<TennisAnalysisResponseDto> {
    try {
      this.logger.log(`开始分析网球视频: ${videoUrl}`);

      const prompt = `
请分析这个网球视频，并根据NTRP（National Tennis Rating Program）标准对球员进行评分, 。
请以JSON格式返回分析结果，包含以下字段：

{
  "overallRating": 整体NTRP评分 (1.0-7.0),
  "serve": {
    "score": 发球技术评分 (1-7),
    "reason": "评分原因"
  },
  "forehand": {
    "score": 正手击球评分 (1-7),
    "reason": "评分原因"
  },
  "backhand": {
    "score": 反手击球评分 (1-7),
    "reason": "评分原因"
  },
  "movement": {
    "score": 移动步伐评分 (1-7),
    "reason": "评分原因"
  },
  "netPlay": {
    "score": 网前技术评分 (1-7),
    "reason": "评分原因"
  },
  "improvements": ["改进建议1", "改进建议2", "改进建议3"]
}

请仔细观察球员的技术动作、战术意识、移动能力等方面，给出专业的评分和建议，评分标准请严谨、严格， 大部分视频的平均水平应该不超过 3 分，如果
模糊导致看不清楚，也请在原因中告知用户，并且这种评分通常是 0-1 之间。
`;

      const response = await this.openai.chat.completions.create({
        model: 'qwen-vl-max-latest',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'video_url' as any,
              video_url: videoUrl
            },
            {
              type: 'text',
              text: prompt
            }
          ] as any
        }],
        temperature: 0.7,
        max_completion_tokens: 3000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new BadRequestException('AI分析返回空结果');
      }

      this.logger.log(`AI分析原始响应: ${content}`);

      // 尝试解析JSON响应
      let analysisResult: TennisAnalysisResponseDto;
      try {
        // 提取JSON部分（可能包含在代码块中）
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
        
        analysisResult = JSON.parse(jsonString.trim());
      } catch (parseError) {
        this.logger.error(`JSON解析失败: ${parseError.message}`);
        throw new BadRequestException('AI返回的分析结果格式错误');
      }

      // 验证结果格式
      this.validateAnalysisResult(analysisResult);

      this.logger.log(`网球视频分析完成，整体评分: ${analysisResult.overallRating}`);
      
      // 如果提供了用户ID，保存评分记录到数据库
      if (userId) {
        try {
          await this.tennisScoreService.createScore(
            userId,
            { videoUrl },
            analysisResult,
            content
          );
          this.logger.log(`评分记录已保存到数据库，用户ID: ${userId}`);
        } catch (saveError) {
          this.logger.error(`保存评分记录失败: ${saveError.message}`, saveError.stack);
          // 不影响主要功能，继续返回分析结果
        }
      }
      
      return analysisResult;

    } catch (error) {
      this.logger.error(`网球视频分析失败: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`视频分析失败: ${error.message}`);
    }
  }

  private validateAnalysisResult(result: any): void {
    const requiredFields = ['overallRating', 'serve', 'forehand', 'backhand', 'movement', 'netPlay', 'improvements'];
    const technicalFields = ['serve', 'forehand', 'backhand', 'movement', 'netPlay'];

    for (const field of requiredFields) {
      if (!(field in result)) {
        throw new BadRequestException(`分析结果缺少必需字段: ${field}`);
      }
    }

    // 验证技术评分字段
    for (const field of technicalFields) {
      const tech = result[field];
      if (!tech || typeof tech.score !== 'number' || typeof tech.reason !== 'string') {
        throw new BadRequestException(`技术评分字段格式错误: ${field}`);
      }
    }

    // 验证改进建议
    if (!Array.isArray(result.improvements)) {
      throw new BadRequestException('改进建议必须是数组格式');
    }
  }
} 