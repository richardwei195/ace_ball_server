import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVenueRatingDto {
  @ApiProperty({
    description: '场馆ID',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  venueId: number;

  @ApiProperty({
    description: '评分 (1-5分)',
    example: 4,
    minimum: 1,
    maximum: 5
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: '评价描述',
    example: '场地环境很好，服务态度不错，推荐！',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateVenueRatingDto {
  @ApiProperty({
    description: '评分 (1-5分)',
    example: 5,
    minimum: 1,
    maximum: 5,
    required: false
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({
    description: '评价描述',
    example: '更新后的评价内容',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class VenueRatingDto {
  @ApiProperty({ description: '评分ID', example: 1 })
  id: number;

  @ApiProperty({ description: '场馆ID', example: 1 })
  venueId: number;

  @ApiProperty({ description: '用户ID', example: 'user-uuid' })
  userId: string;

  @ApiProperty({ description: '评分 (1-5分)', example: 4 })
  rating: number;

  @ApiProperty({ description: '评价描述', example: '场地环境很好' })
  description: string;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ description: '用户信息', required: false })
  user?: {
    id: string;
    name: string;
    avatar: string;
  };
}

export class VenueRatingStatsDto {
  @ApiProperty({ description: '平均评分', example: 4.2 })
  averageRating: number;

  @ApiProperty({ description: '总评分数', example: 25 })
  totalRatings: number;

  @ApiProperty({ description: '各星级评分统计' })
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export class QueryVenueRatingDto {
  @ApiProperty({
    description: '页码',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    example: 10,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiProperty({
    description: '评分筛选',
    example: 5,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
} 