import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTennisScoreDto {
  @ApiProperty({
    description: '视频URL地址',
    example: 'https://example.com/tennis-video.mp4'
  })
  @IsString()
  @IsNotEmpty()
  videoUrl: string;
}

export class TennisScoreResponseDto {
  @ApiProperty({ description: '评分记录ID', example: 1 })
  id: number;

  @ApiProperty({ description: '用户ID', example: 'user-123' })
  userId: string;

  @ApiProperty({ description: '视频URL', example: 'https://example.com/tennis-video.mp4' })
  videoUrl: string;

  @ApiProperty({ description: 'NTRP整体评分 (1.0-7.0)', example: 4.0 })
  overallRating: number;

  @ApiProperty({ description: '发球技术评分 (1-7)', example: 4.5 })
  serveScore: number;

  @ApiProperty({ description: '发球技术评分原因', example: '发球动作基本正确，但力量控制需要改进' })
  serveReason: string;

  @ApiProperty({ description: '正手击球评分 (1-7)', example: 4.2 })
  forehandScore: number;

  @ApiProperty({ description: '正手击球评分原因', example: '正手击球稳定性较好，但缺乏变化' })
  forehandReason: string;

  @ApiProperty({ description: '反手击球评分 (1-7)', example: 3.8 })
  backhandScore: number;

  @ApiProperty({ description: '反手击球评分原因', example: '反手击球技术有待提高，建议加强练习' })
  backhandReason: string;

  @ApiProperty({ description: '移动步伐评分 (1-7)', example: 4.0 })
  movementScore: number;

  @ApiProperty({ description: '移动步伐评分原因', example: '移动步伐基本合理，但反应速度可以更快' })
  movementReason: string;

  @ApiProperty({ description: '网前技术评分 (1-7)', example: 3.5 })
  netPlayScore: number;

  @ApiProperty({ description: '网前技术评分原因', example: '网前技术需要加强，截击动作不够熟练' })
  netPlayReason: string;

  @ApiProperty({ 
    description: '改进建议', 
    example: ['加强发球力量训练', '改善反手击球稳定性', '提高移动速度'] 
  })
  improvements: string[];

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class QueryTennisScoreDto {
  @ApiProperty({ description: '页码', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ description: '最小评分', example: 1.0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1.0)
  @Max(7.0)
  minRating?: number;

  @ApiProperty({ description: '最大评分', example: 7.0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1.0)
  @Max(7.0)
  maxRating?: number;

  @ApiProperty({ description: '开始日期', example: '2024-01-01', required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ description: '结束日期', example: '2024-12-31', required: false })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class TennisScoreListResponseDto {
  @ApiProperty({ description: '评分记录列表', type: [TennisScoreResponseDto] })
  data: TennisScoreResponseDto[];

  @ApiProperty({ description: '总数量', example: 100 })
  total: number;

  @ApiProperty({ description: '当前页码', example: 1 })
  page: number;

  @ApiProperty({ description: '每页数量', example: 10 })
  limit: number;

  @ApiProperty({ description: '总页数', example: 10 })
  totalPages: number;
}

export class TennisScoreStatsDto {
  @ApiProperty({ description: '总评分次数', example: 25 })
  totalScores: number;

  @ApiProperty({ description: '平均整体评分', example: 4.2 })
  averageRating: number;

  @ApiProperty({ description: '最高评分', example: 5.5 })
  highestRating: number;

  @ApiProperty({ description: '最低评分', example: 3.0 })
  lowestRating: number;

  @ApiProperty({ description: '最近评分', example: 4.0 })
  latestRating: number;

  @ApiProperty({ description: '评分趋势（最近5次）', example: [3.5, 3.8, 4.0, 4.2, 4.0] })
  recentTrend: number[];
} 