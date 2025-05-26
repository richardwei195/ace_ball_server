import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { TennisScore } from './models/tennis-score.model';
import { User } from './models/user.model';
import {
  CreateTennisScoreDto,
  TennisScoreResponseDto,
  QueryTennisScoreDto,
  TennisScoreListResponseDto,
  TennisScoreStatsDto
} from './dto/tennis-score.dto';
import { TennisAnalysisResponseDto } from './dto/tennis-analysis-response.dto';

@Injectable()
export class TennisScoreService {
  private readonly logger = new Logger(TennisScoreService.name);

  constructor(
    @InjectModel(TennisScore)
    private tennisScoreModel: typeof TennisScore,
    @InjectModel(User)
    private userModel: typeof User,
  ) { }

  /**
   * 创建评分记录
   */
  async createScore(
    userId: string,
    createDto: CreateTennisScoreDto,
    analysisResult: TennisAnalysisResponseDto,
    rawResponse?: string
  ): Promise<TennisScoreResponseDto> {
    try {
      this.logger.log(`创建评分记录，用户ID: ${userId}, 视频URL: ${createDto.videoUrl}`);

      const scoreData = {
        userId,
        videoUrl: createDto.videoUrl,
        overallRating: analysisResult.overallRating,
        serveScore: analysisResult.serve.score,
        serveReason: analysisResult.serve.reason,
        forehandScore: analysisResult.forehand.score,
        forehandReason: analysisResult.forehand.reason,
        backhandScore: analysisResult.backhand.score,
        backhandReason: analysisResult.backhand.reason,
        movementScore: analysisResult.movement.score,
        movementReason: analysisResult.movement.reason,
        netPlayScore: analysisResult.netPlay.score,
        netPlayReason: analysisResult.netPlay.reason,
        improvements: analysisResult.improvements,
        rawResponse: rawResponse || '',
      };

      const score = await this.tennisScoreModel.create(scoreData);

      this.logger.log(`评分记录创建成功，ID: ${score.id}`);
      return this.formatScoreResponse(score);

    } catch (error) {
      this.logger.error(`创建评分记录失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取用户评分记录列表
   */
  async getUserScores(userId: string, queryDto: QueryTennisScoreDto): Promise<TennisScoreListResponseDto> {
    try {
      this.logger.log(`获取用户评分记录，用户ID: ${userId}`);

      const { page = 1, limit = 10, minRating, maxRating, startDate, endDate } = queryDto;
      const offset = (page - 1) * limit;

      // 构建查询条件
      const whereConditions: any = { userId };

      if (minRating !== undefined || maxRating !== undefined) {
        whereConditions.overallRating = {};
        if (minRating !== undefined) {
          whereConditions.overallRating[Op.gte] = minRating;
        }
        if (maxRating !== undefined) {
          whereConditions.overallRating[Op.lte] = maxRating;
        }
      }

      if (startDate || endDate) {
        whereConditions.createdAt = {};
        if (startDate) {
          whereConditions.createdAt[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          whereConditions.createdAt[Op.lte] = new Date(endDate + ' 23:59:59');
        }
      }

      const { count, rows } = await this.tennisScoreModel.findAndCountAll({
        where: whereConditions,
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      const totalPages = Math.ceil(count / limit);

      return {
        data: rows.map(score => this.formatScoreResponse(score)),
        total: count,
        page,
        limit,
        totalPages,
      };

    } catch (error) {
      this.logger.error(`获取用户评分记录失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取单个评分记录详情
   */
  async getScoreById(id: number, userId: string): Promise<TennisScoreResponseDto> {
    try {
      this.logger.log(`获取评分记录详情，ID: ${id}, 用户ID: ${userId}`);

      const score = await this.tennisScoreModel.findOne({
        where: { id, userId },
      });

      if (!score) {
        throw new NotFoundException('评分记录不存在');
      }

      return this.formatScoreResponse(score);

    } catch (error) {
      this.logger.error(`获取评分记录详情失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 获取用户评分统计
   */
  async getUserStats(userId: string): Promise<TennisScoreStatsDto> {
    try {
      this.logger.log(`获取用户评分统计，用户ID: ${userId}`);

      const scores = await this.tennisScoreModel.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: 100, // 限制查询数量以提高性能
      });

      if (scores.length === 0) {
        return {
          totalScores: 0,
          averageRating: 0,
          highestRating: 0,
          lowestRating: 0,
          latestRating: 0,
          recentTrend: [],
        };
      }

      const ratings = scores.map(score => score.overallRating);
      const recentRatings = ratings.slice(0, 5);

      const stats: TennisScoreStatsDto = {
        totalScores: scores.length,
        averageRating: Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)),
        highestRating: Math.max(...ratings),
        lowestRating: Math.min(...ratings),
        latestRating: ratings[0] || 0,
        recentTrend: recentRatings.reverse(), // 按时间正序排列
      };

      this.logger.log(`用户评分统计获取成功，总评分次数: ${stats.totalScores}`);
      return stats;

    } catch (error) {
      this.logger.error(`获取用户评分统计失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 删除评分记录
   */
  async deleteScore(id: number, userId: string): Promise<void> {
    try {
      this.logger.log(`删除评分记录，ID: ${id}, 用户ID: ${userId}`);

      const result = await this.tennisScoreModel.destroy({
        where: { id, userId },
      });

      if (result === 0) {
        throw new NotFoundException('评分记录不存在');
      }

      this.logger.log(`评分记录删除成功，ID: ${id}`);

    } catch (error) {
      this.logger.error(`删除评分记录失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 格式化评分记录响应
   */
  private formatScoreResponse(score: TennisScore): TennisScoreResponseDto {
    return {
      id: score.id,
      userId: score.userId,
      videoUrl: score.videoUrl,
      overallRating: score.overallRating,
      serveScore: score.serveScore,
      serveReason: score.serveReason,
      forehandScore: score.forehandScore,
      forehandReason: score.forehandReason,
      backhandScore: score.backhandScore,
      backhandReason: score.backhandReason,
      movementScore: score.movementScore,
      movementReason: score.movementReason,
      netPlayScore: score.netPlayScore,
      netPlayReason: score.netPlayReason,
      improvements: score.improvements,
      createdAt: score.createdAt,
      updatedAt: score.updatedAt,
    };
  }
} 