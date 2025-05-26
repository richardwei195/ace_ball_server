import { IsString, IsUrl, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeVideoDto {
  @ApiProperty({
    description: '视频URL地址',
    example: 'https://example.com/tennis-video.mp4'
  })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  videoUrl: string;
} 