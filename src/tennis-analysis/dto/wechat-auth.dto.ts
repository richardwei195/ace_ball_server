import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WechatLoginDto {
  @ApiProperty({
    description: '微信小程序登录凭证code',
    example: '081Kq4Ga1rXXXX'
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: '用户昵称',
    example: '网球爱好者',
    required: false
  })
  @IsString()
  @IsOptional()
  nickName?: string;

  @ApiProperty({
    description: '用户头像URL',
    example: 'https://wx.qlogo.cn/mmopen/xxx',
    required: false
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

export class WechatUserInfoDto {
  @ApiProperty({
    description: '加密的用户数据',
    example: 'CiyLU1Aw2KjvrjMdj8YKliAjtP4gsMZM...'
  })
  @IsString()
  @IsNotEmpty()
  encryptedData: string;

  @ApiProperty({
    description: '加密算法的初始向量',
    example: 'r7BXXsRzlf6H2bnfTuDxwg=='
  })
  @IsString()
  @IsNotEmpty()
  iv: string;

  @ApiProperty({
    description: '微信小程序登录凭证code',
    example: '081Kq4Ga1rXXXX'
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class WechatAuthResponseDto {
  @ApiProperty({ description: '用户唯一标识', example: 'oGZUI0egBJY1zhBYw2KhdUfwVJJE' })
  openid: string;

  @ApiProperty({ description: '用户在开放平台的唯一标识', example: 'o6_bmjrPTlm6_2sgVt7hMZOPfL2M', required: false })
  unionid?: string;

  @ApiProperty({ description: '会话密钥', example: 'tiihtNczf5v6AKRyjwEUhQ==' })
  sessionKey: string;

  @ApiProperty({ description: 'JWT访问令牌', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ description: '用户昵称', example: '网球爱好者', required: false })
  nickName?: string;

  @ApiProperty({ description: '用户头像URL', example: 'https://wx.qlogo.cn/mmopen/xxx', required: false })
  avatarUrl?: string;
}

export class UserProfileDto {
  @ApiProperty({ description: '用户ID', example: 1 })
  id: number;

  @ApiProperty({ description: '用户唯一标识', example: 'oGZUI0egBJY1zhBYw2KhdUfwVJJE' })
  openid: string;

  @ApiProperty({ description: '用户在开放平台的唯一标识', example: 'o6_bmjrPTlm6_2sgVt7hMZOPfL2M', required: false })
  unionid?: string;

  @ApiProperty({ description: '用户昵称', example: '网球爱好者' })
  nickName: string;

  @ApiProperty({ description: '用户头像URL', example: 'https://wx.qlogo.cn/mmopen/xxx' })
  avatarUrl: string;

  @ApiProperty({ description: '用户性别 0-未知 1-男 2-女', example: 1 })
  gender: number;

  @ApiProperty({ description: '用户所在城市', example: '深圳' })
  city: string;

  @ApiProperty({ description: '用户所在省份', example: '广东' })
  province: string;

  @ApiProperty({ description: '用户所在国家', example: '中国' })
  country: string;

  @ApiProperty({ description: '用户语言', example: 'zh_CN' })
  language: string;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
} 