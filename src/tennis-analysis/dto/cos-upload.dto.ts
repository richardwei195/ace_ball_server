import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetUploadTokenDto {
  @ApiProperty({
    description: '文件类型',
    example: 'video',
    enum: ['video', 'image', 'document']
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['video', 'image', 'document'])
  fileType: string;

  @ApiProperty({
    description: '文件扩展名',
    example: 'mp4',
    required: false
  })
  @IsString()
  @IsOptional()
  fileExtension?: string;

  @ApiProperty({
    description: '文件大小（字节）',
    example: 10485760,
    required: false
  })
  @IsOptional()
  fileSize?: number;
}

export class CosUploadTokenResponseDto {
  @ApiProperty({ description: '临时访问密钥ID', example: 'AKIDxxxxxxxx' })
  tmpSecretId: string;

  @ApiProperty({ description: '临时访问密钥Key', example: 'xxxxxxxx' })
  tmpSecretKey: string;

  @ApiProperty({ description: '安全令牌', example: 'xxxxxxxx' })
  sessionToken: string;

  @ApiProperty({ description: '密钥有效期开始时间', example: 1609459200 })
  startTime: number;

  @ApiProperty({ description: '密钥有效期结束时间', example: 1609462800 })
  expiredTime: number;

  @ApiProperty({ description: 'COS存储桶名称', example: 'tennis-videos-1234567890' })
  bucket: string;

  @ApiProperty({ description: 'COS地域', example: 'ap-guangzhou' })
  region: string;

  @ApiProperty({ description: '上传路径前缀', example: 'videos/2024/01/01/' })
  prefix: string;

  @ApiProperty({ description: 'CDN访问域名', example: 'https://cdn.example.com' })
  cdnDomain: string;
}
