import { IsString, IsOptional, IsNumber, Min, Max, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BookingMethodType } from '../models/tennis-venue-booking-method.model';

export class QueryTennisVenueDto {
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

  @ApiProperty({ description: '城市筛选', example: '广州', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: '预订方式筛选',
    example: ['h5', 'miniprogram'],
    required: false,
    enum: BookingMethodType,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsEnum(BookingMethodType, { each: true })
  bookingTypes?: BookingMethodType[];

  @ApiProperty({ description: '是否营业', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isOpen?: boolean;

  @ApiProperty({ description: '关键词搜索', example: '体育中心', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;
}

export class BookingMethodDto {
  @ApiProperty({ description: '预订方式类型', example: 'h5' })
  type: BookingMethodType;

  @ApiProperty({ description: '预订方式名称', example: '在线预订' })
  name: string;

  @ApiProperty({ description: '图标名称', example: 'internet' })
  icon: string;

  @ApiProperty({ description: '主题颜色', example: '#4facfe' })
  color: string;

  @ApiProperty({ description: 'H5链接', example: 'https://tianhe-sports.gov.cn', required: false })
  url?: string;

  @ApiProperty({ description: '小程序AppID', example: 'wx1111111111', required: false })
  appId?: string;

  @ApiProperty({ description: '小程序页面路径', example: 'pages/venue/tennis', required: false })
  path?: string;

  @ApiProperty({ description: '联系电话', example: '020-99999999', required: false })
  phone?: string;
}

export class TennisVenueDto {
  @ApiProperty({ description: '场馆ID', example: 6 })
  id: number;

  @ApiProperty({ description: '场馆名称', example: '广州天河体育中心' })
  name: string;

  @ApiProperty({ description: '所在城市', example: '广州' })
  city: string;

  @ApiProperty({ description: '场馆地址', example: '天河区体育西路' })
  location: string;

  @ApiProperty({ description: '营业时间', example: '08:00-20:00' })
  openTime: string;

  @ApiProperty({ description: '是否营业', example: true })
  isOpen: boolean;

  @ApiProperty({ description: '价格区间', example: '¥50-120/小时' })
  priceRange: string;

  @ApiProperty({ description: '场馆特色服务', example: ['标准场地', '器材租赁', '教练服务'] })
  features: string[];

  @ApiProperty({ description: '场馆描述', example: '专业网球场地，设施完善', required: false })
  description?: string;

  @ApiProperty({ description: '场馆图片URL', example: 'https://example.com/venue.jpg', required: false })
  imageUrl?: string;

  @ApiProperty({ description: '预订方式列表', type: [BookingMethodDto] })
  bookingMethods: BookingMethodDto[];

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class TennisVenueListResponseDto {
  @ApiProperty({ description: '场馆列表', type: [TennisVenueDto] })
  data: TennisVenueDto[];

  @ApiProperty({ description: '总数量', example: 25 })
  total: number;

  @ApiProperty({ description: '当前页码', example: 1 })
  page: number;

  @ApiProperty({ description: '每页数量', example: 10 })
  limit: number;

  @ApiProperty({ description: '总页数', example: 3 })
  totalPages: number;

  @ApiProperty({ description: '可用城市列表', example: ['广州', '深圳', '北京'] })
  availableCities: string[];
}

export class CreateTennisVenueDto {
  @ApiProperty({ description: '场馆名称', example: '广州天河体育中心' })
  @IsString()
  name: string;

  @ApiProperty({ description: '所在城市', example: '广州' })
  @IsString()
  city: string;

  @ApiProperty({ description: '场馆地址', example: '天河区体育西路' })
  @IsString()
  location: string;

  @ApiProperty({ description: '营业时间', example: '08:00-20:00' })
  @IsString()
  openTime: string;

  @ApiProperty({ description: '是否营业', example: true })
  @IsBoolean()
  isOpen: boolean;

  @ApiProperty({ description: '价格区间', example: '¥50-120/小时' })
  @IsString()
  priceRange: string;

  @ApiProperty({ description: '场馆特色服务', example: ['标准场地', '器材租赁', '教练服务'] })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiProperty({ description: '场馆描述', example: '专业网球场地，设施完善', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '场馆图片URL', example: 'https://example.com/venue.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: '排序权重', example: 0, required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateBookingMethodDto {
  @ApiProperty({ description: '预订方式类型', example: 'h5' })
  @IsEnum(BookingMethodType)
  type: BookingMethodType;

  @ApiProperty({ description: '预订方式名称', example: '在线预订' })
  @IsString()
  name: string;

  @ApiProperty({ description: '图标名称', example: 'internet' })
  @IsString()
  icon: string;

  @ApiProperty({ description: '主题颜色', example: '#4facfe' })
  @IsString()
  color: string;

  @ApiProperty({ description: 'H5链接', example: 'https://tianhe-sports.gov.cn', required: false })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({ description: '小程序AppID', example: 'wx1111111111', required: false })
  @IsOptional()
  @IsString()
  appId?: string;

  @ApiProperty({ description: '小程序页面路径', example: 'pages/venue/tennis', required: false })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiProperty({ description: '联系电话', example: '020-99999999', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '是否启用', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiProperty({ description: '排序权重', example: 0, required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
} 