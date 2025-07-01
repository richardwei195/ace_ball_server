import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Query, Param, Delete, Put, HttpException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TennisAnalysisService } from './tennis-analysis.service';
import { WechatService } from './wechat.service';
import { TennisScoreService } from './tennis-score.service';
import { TennisVenueService } from './tennis-venue.service';
import { CosService } from './cos.service';
import { AnalyzeVideoDto } from './dto/analyze-video.dto';
import { TennisAnalysisResponseDto } from './dto/tennis-analysis-response.dto';
import { WechatLoginDto, WechatAuthResponseDto, UserProfileDto, UpdateUserProfileDto } from './dto/wechat-auth.dto';
import { QueryTennisScoreDto, TennisScoreStatsDto } from './dto/tennis-score.dto';
import { QueryTennisVenueDto, TennisVenueListResponseDto, TennisVenueDto } from './dto/tennis-venue.dto';
import { GetUploadTokenDto, CosUploadTokenResponseDto } from './dto/cos-upload.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './decorators/user.decorator';
import { RedisService } from '../redis/redis.service';
import { API_CODE } from 'src/common/constants';

@ApiTags('网球分析')
@Controller('tennis-analysis')
export class TennisAnalysisController {
  private readonly logger = new Logger(TennisAnalysisController.name);
  constructor(
    private readonly tennisAnalysisService: TennisAnalysisService,
    private readonly wechatService: WechatService,
    private readonly tennisScoreService: TennisScoreService,
    private readonly tennisVenueService: TennisVenueService,
    private readonly cosService: CosService,
    private readonly redisService: RedisService,
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

  @Get('task-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取用户任务状态',
    description: '查看当前用户是否有正在进行的分析任务'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        hasActiveTask: { type: 'boolean', description: '是否有活跃任务' },
        taskInfo: {
          type: 'object',
          description: '任务信息',
          properties: {
            taskId: { type: 'string', description: '任务ID' },
            startTime: { type: 'string', description: '开始时间' },
            status: { type: 'string', description: '任务状态' }
          }
        }
      }
    }
  })
  async getTaskStatus(@User() user: any): Promise<any> {
    const userInfo = await this.wechatService.getUserByOpenid(user.openid);
    if (!userInfo) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    const hasActiveTask = await this.redisService.hasActiveTask(userInfo.id.toString());
    const taskInfo = hasActiveTask ? await this.redisService.getUserTask(userInfo.id.toString()) : null;

    return {
      hasActiveTask,
      taskInfo,
      message: hasActiveTask ? '您有正在进行的分析任务' : '当前没有进行中的任务'
    };
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
    this.logger.log('getProfile user', user);
    const userInfo = await this.wechatService.getUserByOpenid(user.openid);
    if (!userInfo) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    this.logger.log('getProfile userInfo', userInfo);
    return {
      user: userInfo,
      message: '用户信息获取成功'
    };
  }

  @Put('auth/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '更新用户信息',
    description: '更新当前用户的个人信息，包括头像、昵称、性别、NTRP评分和惯用手'
  })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    schema: {
      type: 'object',
      properties: {
        user: { type: 'object', description: '更新后的用户信息' },
        message: { type: 'string', description: '响应消息' }
      }
    }
  })
  @ApiBadRequestResponse({
    description: '请求参数错误或更新失败',
  })
  async updateProfile(@Body() updateDto: UpdateUserProfileDto, @User() user: any): Promise<any> {
    this.logger.log('updateProfile user', user);
    this.logger.log('updateProfile updateDto', updateDto);

    const updatedUser = await this.wechatService.updateUserProfile(user.openid, updateDto);

    return {
      user: updatedUser,
      message: '用户信息更新成功'
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

  })
  async getUserScores(@User() user: any, @Query() queryDto: QueryTennisScoreDto): Promise<any> {
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
  })
  async getScoreById(
    @Param('id') id: number,
    @User() user: any,
    @Query('userId') userId: string,
  ): Promise<any> {
    try {
      this.logger.log('getScoreById id', id);
      this.logger.log('getScoreById userId', userId);

      const userInfo = await this.wechatService.getUserByOpenid(user.openid);

      if (!userInfo) {
        return {
          code: API_CODE.USER_NOT_FOUND,
          message: '用户不存在',
          data: null,
        };
      }

      const result = await this.tennisScoreService.getScoreById(id, userId);

      this.logger.log('getScoreById result', result);

      return {
        code: API_CODE.SUCCESS,
        message: '获取成功',
        data: result,
      };
    } catch (error) {
      this.logger.error('getScoreById error', error);
      return {
        code: API_CODE.SYSTEM_ERROR,
        message: error.message || '系统错误',
        data: null,
      }
    }
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
  async deleteScore(@Param('id') id: number, @User() user: any): Promise<any> {
    try {
      this.logger.log('deleteScore id', id);
      this.logger.log('deleteScore user', user);

      const userInfo = await this.wechatService.getUserByOpenid(user.openid);
      if (!userInfo) {
        throw new Error('用户不存在');
      }
      await this.tennisScoreService.deleteScore(id, userInfo.id);

      this.logger.log('id: ' + id + ' deleteScore success');
      return {
        code: API_CODE.SUCCESS,
        message: '删除成功',
        data: null,
      }
    } catch (error) {
      this.logger.error('deleteScore error', error);
      return {
        code: API_CODE.SYSTEM_ERROR,
        message: error.message || '系统错误',
        data: null,
      }
    }
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

    // 验证文件大小
    if (uploadDto.fileSize) {
      const sizeLimit = this.cosService.getFileSizeLimit(uploadDto.fileType);
      if (uploadDto.fileSize > sizeLimit) {
        throw new Error(`文件大小超出限制，最大允许: ${Math.round(sizeLimit / 1024 / 1024)}MB`);
      }
    }

    return this.cosService.getUploadToken(userInfo.id, uploadDto);
  }

  @Get('venues')
  @ApiOperation({
    summary: '获取网球场馆列表',
    description: '分页获取网球场馆列表，支持城市、预订方式、营业状态等筛选条件'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: TennisVenueListResponseDto,
  })
  async getVenues(@Query() queryDto: QueryTennisVenueDto): Promise<any> {
    try {
      const result = await this.tennisVenueService.getVenues(queryDto);
      return {
        code: API_CODE.SUCCESS,
        message: '获取场馆列表成功',
        data: result,
      };
    } catch (error) {
      this.logger.error('getVenues error', error);
      return {
        code: API_CODE.SYSTEM_ERROR,
        message: error.message || '获取场馆列表失败',
        data: null,
      };
    }
  }

  @Get('venues/:id')
  @ApiOperation({
    summary: '获取场馆详情',
    description: '根据场馆ID获取详细信息'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: TennisVenueDto,
  })
  async getVenueById(@Param('id') id: number): Promise<any> {
    try {
      const result = await this.tennisVenueService.getVenueById(id);
      return {
        code: API_CODE.SUCCESS,
        message: '获取场馆详情成功',
        data: result,
      };
    } catch (error) {
      this.logger.error('getVenueById error', error);
      return {
        code: API_CODE.SYSTEM_ERROR,
        message: error.message || '获取场馆详情失败',
        data: null,
      };
    }
  }

  @Get('venues/popular/list')
  @ApiOperation({
    summary: '获取热门场馆',
    description: '获取热门推荐的网球场馆列表'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [TennisVenueDto],
  })
  async getPopularVenues(@Query('limit') limit?: number): Promise<any> {
    try {
      const result = await this.tennisVenueService.getPopularVenues(limit || 10);
      return {
        code: API_CODE.SUCCESS,
        message: '获取热门场馆成功',
        data: result,
      };
    } catch (error) {
      this.logger.error('getPopularVenues error', error);
      return {
        code: API_CODE.SYSTEM_ERROR,
        message: error.message || '获取热门场馆失败',
        data: null,
      };
    }
  }

  @Get('venues/search/keyword')
  @ApiOperation({
    summary: '搜索场馆',
    description: '根据关键词搜索网球场馆'
  })
  @ApiResponse({
    status: 200,
    description: '搜索成功',
    type: [TennisVenueDto],
  })
  async searchVenues(
    @Query('keyword') keyword: string,
    @Query('limit') limit?: number
  ): Promise<any> {
    try {
      const result = await this.tennisVenueService.searchVenues(keyword, limit || 20);
      return {
        code: API_CODE.SUCCESS,
        message: '搜索场馆成功',
        data: result,
      };
    } catch (error) {
      this.logger.error('searchVenues error', error);
      return {
        code: API_CODE.SYSTEM_ERROR,
        message: error.message || '搜索场馆失败',
        data: null,
      };
    }
  }

  @Get('venues/cities/available')
  @ApiOperation({
    summary: '获取可用城市列表',
    description: '获取有场馆的城市列表'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取城市列表成功' },
        data: { type: 'array', items: { type: 'string' }, example: ['广州', '深圳', '北京'] }
      }
    }
  })
  async getAvailableCities(): Promise<any> {
    try {
      const result = await this.tennisVenueService.getAvailableCities();
      return {
        code: API_CODE.SUCCESS,
        message: '获取城市列表成功',
        data: result,
      };
    } catch (error) {
      this.logger.error('getAvailableCities error', error);
      return {
        code: API_CODE.SYSTEM_ERROR,
        message: error.message || '获取城市列表失败',
        data: null,
      };
    }
  }
} 