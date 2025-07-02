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

  @ApiProperty({ description: '用户ID（可选，用于查询指定用户的评分记录）', example: '123', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

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