import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Query, Param, Delete, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TennisAnalysisService } from './tennis-analysis.service';
import { WechatService } from './wechat.service';
import { TennisScoreService } from './tennis-score.service';
import { CosService } from './cos.service';
import { AnalyzeVideoDto } from './dto/analyze-video.dto';
import { TennisAnalysisResponseDto } from './dto/tennis-analysis-response.dto';
import { WechatLoginDto, WechatUserInfoDto, WechatAuthResponseDto, UserProfileDto } from './dto/wechat-auth.dto';
import { CreateTennisScoreDto, TennisScoreResponseDto, QueryTennisScoreDto, TennisScoreListResponseDto, TennisScoreStatsDto } from './dto/tennis-score.dto';
import { GetUploadTokenDto, CosUploadTokenResponseDto, CosUploadCompleteDto, CosUploadCompleteResponseDto } from './dto/cos-upload.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './decorators/user.decorator';

@ApiTags('网球分析')
@Controller('tennis-analysis')
export class TennisAnalysisController {
  constructor(
    private readonly tennisAnalysisService: TennisAnalysisService,
    private readonly wechatService: WechatService,
    private readonly tennisScoreService: TennisScoreService,
    private readonly cosService: CosService,
  ) { }

  @Post('analyze-video')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '分析网球视频',
    description: '上传网球视频URL，使用AI分析球员的NTRP技术水平并提供改进建议'
  })
  @ApiResponse({
    status: 200,
    description: '分析成功',
    type: TennisAnalysisResponseDto,
  })
  @ApiBadRequestResponse({
    description: '请求参数错误或分析失败',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async analyzeVideo(@Body() analyzeVideoDto: AnalyzeVideoDto, @User() user: any): Promise<TennisAnalysisResponseDto> {
    // 获取用户信息
    const userInfo = await this.wechatService.getUserByOpenid(user.openid);
    const userId = userInfo?.id;

    return this.tennisAnalysisService.analyzeVideo(analyzeVideoDto.videoUrl, userId);
  }

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '微信小程序登录',
    description: '使用微信小程序code进行登录，获取访问令牌'
  })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    type: WechatAuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: '登录失败',
  })
  async wechatLogin(@Body() loginDto: WechatLoginDto): Promise<WechatAuthResponseDto> {
    return this.wechatService.login(loginDto);
  }

  @Post('auth/user-info')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取用户详细信息',
    description: '解密微信用户信息，获取用户详细资料'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: UserProfileDto,
  })
  @ApiBadRequestResponse({
    description: '获取失败',
  })
  async getUserInfo(@Body() userInfoDto: WechatUserInfoDto): Promise<UserProfileDto> {
    return this.wechatService.getUserInfo(userInfoDto);
  }

  @Get('auth/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取当前用户信息',
    description: '通过JWT token获取当前登录用户的信息'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: UserProfileDto,
  })
  async getProfile(@User() user: any): Promise<any> {
    console.log('getProfile user', user);
    const userInfo = await this.wechatService.getUserByOpenid(user.openid);
    if (!userInfo) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    console.log('getProfile userInfo', userInfo);
    return {
      user: userInfo,
      message: '用户信息获取成功'
    };
  }

  @Post('auth/refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '刷新访问令牌',
    description: '使用旧的token刷新获取新的访问令牌'
  })
  @ApiResponse({
    status: 200,
    description: '刷新成功',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', description: '新的访问令牌' }
      }
    }
  })
  async refreshToken(@Body('token') token: string): Promise<{ accessToken: string }> {
    const newToken = await this.wechatService.refreshToken(token);
    return { accessToken: newToken };
  }

  @Get('scores')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取用户评分记录列表',
    description: '分页获取当前用户的网球评分记录'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: TennisScoreListResponseDto,
  })
  async getUserScores(@User() user: any, @Query() queryDto: QueryTennisScoreDto): Promise<TennisScoreListResponseDto> {
    const userInfo = await this.wechatService.getUserByOpenid(user.openid);
    if (!userInfo) {
      throw new Error('用户不存在');
    }
    return this.tennisScoreService.getUserScores(userInfo.id, queryDto);
  }

  @Get('scores/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取评分记录详情',
    description: '获取指定ID的评分记录详细信息'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: TennisScoreResponseDto,
  })
  async getScoreById(@Param('id') id: number, @User() user: any): Promise<TennisScoreResponseDto> {
    const userInfo = await this.wechatService.getUserByOpenid(user.openid);
    if (!userInfo) {
      throw new Error('用户不存在');
    }
    return this.tennisScoreService.getScoreById(id, userInfo.id);
  }

  @Get('scores/stats/summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取用户评分统计',
    description: '获取用户的评分统计信息，包括平均分、最高分等'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: TennisScoreStatsDto,
  })
  async getUserStats(@User() user: any): Promise<TennisScoreStatsDto> {
    const userInfo = await this.wechatService.getUserByOpenid(user.openid);
    if (!userInfo) {
      throw new Error('用户不存在');
    }
    return this.tennisScoreService.getUserStats(userInfo.id);
  }

  @Delete('scores/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '删除评分记录',
    description: '删除指定ID的评分记录'
  })
  @ApiResponse({
    status: 204,
    description: '删除成功',
  })
  async deleteScore(@Param('id') id: number, @User() user: any): Promise<void> {
    const userInfo = await this.wechatService.getUserByOpenid(user.openid);
    if (!userInfo) {
      throw new Error('用户不存在');
    }
    return this.tennisScoreService.deleteScore(id, userInfo.id);
  }

  @Post('upload/token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取文件上传临时密钥',
    description: '获取腾讯云COS上传临时密钥，用于客户端直传文件'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: CosUploadTokenResponseDto,
  })
  @ApiBadRequestResponse({
    description: '获取失败',
  })
  async getUploadToken(@User() user: any, @Body() uploadDto: GetUploadTokenDto): Promise<CosUploadTokenResponseDto> {
    const userInfo = await this.wechatService.getUserByOpenid(user.openid);
    if (!userInfo) {
      throw new Error('用户不存在');
    }

    // 验证文件类型和扩展名
    if (uploadDto.fileExtension && !this.cosService.validateFileType(uploadDto.fileType, uploadDto.fileExtension)) {
      throw new Error(`不支持的文件类型: ${uploadDto.fileExtension}`);
    }

    // 验证文件大小
    if (uploadDto.fileSize) {
      const sizeLimit = this.cosService.getFileSizeLimit(uploadDto.fileType);
      if (uploadDto.fileSize > sizeLimit) {
        throw new Error(`文件大小超出限制，最大允许: ${Math.round(sizeLimit / 1024 / 1024)}MB`);
      }
    }

    return this.cosService.getUploadToken(userInfo.id, uploadDto);
  }

  @Post('upload/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '文件上传完成回调',
    description: '客户端上传完成后调用此接口，获取文件访问URL'
  })
  @ApiResponse({
    status: 200,
    description: '处理成功',
    type: CosUploadCompleteResponseDto,
  })
  @ApiBadRequestResponse({
    description: '处理失败',
  })
  async uploadComplete(@User() user: any, @Body() completeDto: CosUploadCompleteDto): Promise<CosUploadCompleteResponseDto> {
    const userInfo = await this.wechatService.getUserByOpenid(user.openid);
    if (!userInfo) {
      throw new Error('用户不存在');
    }

    return this.cosService.uploadComplete(userInfo.id, completeDto);
  }

  @Get('upload/config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取上传配置信息',
    description: '获取文件上传的配置信息，包括支持的文件类型和大小限制'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        supportedTypes: {
          type: 'object',
          description: '支持的文件类型',
          example: {
            video: ['mp4', 'avi', 'mov'],
            image: ['jpg', 'png', 'gif'],
            document: ['pdf', 'doc', 'txt']
          }
        },
        sizeLimits: {
          type: 'object',
          description: '文件大小限制（字节）',
          example: {
            video: 524288000,
            image: 10485760,
            document: 52428800
          }
        }
      }
    }
  })
  async getUploadConfig(): Promise<any> {
    return {
      supportedTypes: {
        video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v'],
        image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
        document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
      },
      sizeLimits: {
        video: this.cosService.getFileSizeLimit('video'),
        image: this.cosService.getFileSizeLimit('image'),
        document: this.cosService.getFileSizeLimit('document'),
      },
    };
  }
} 