import { ApiProperty } from '@nestjs/swagger';

export class TechnicalScore {
  @ApiProperty({ description: '技术评分 (1-7分)', example: 4.5 })
  score: number;

  @ApiProperty({ description: '评分原因', example: '发球动作基本正确，但力量控制需要改进' })
  reason: string;
}

export class TennisAnalysisResponseDto {
  @ApiProperty({ description: 'NTRP整体评分水平 (1.0-7.0)', example: 4.0 })
  overallRating: number;

  @ApiProperty({ description: '发球技术评分', type: TechnicalScore })
  serve: TechnicalScore;

  @ApiProperty({ description: '正手击球评分', type: TechnicalScore })
  forehand: TechnicalScore;

  @ApiProperty({ description: '反手击球评分', type: TechnicalScore })
  backhand: TechnicalScore;

  @ApiProperty({ description: '移动步伐评分', type: TechnicalScore })
  movement: TechnicalScore;

  @ApiProperty({ description: '网前技术评分', type: TechnicalScore })
  netPlay: TechnicalScore;

  @ApiProperty({ 
    description: '改进建议', 
    example: ['加强发球力量训练', '改善反手击球稳定性', '提高移动速度'] 
  })
  improvements: string[];
} 