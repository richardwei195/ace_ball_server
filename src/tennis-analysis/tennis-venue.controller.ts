import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Query, Param, Delete, Put, HttpException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TennisVenueService } from './tennis-venue.service';
import { TennisVenueRatingService } from './tennis-venue-rating.service';
import { WechatService } from './wechat.service';
import { QueryTennisVenueDto, TennisVenueListResponseDto, TennisVenueDto } from './dto/tennis-venue.dto';
import { CreateVenueRatingDto, UpdateVenueRatingDto, QueryVenueRatingDto, VenueRatingDto, VenueRatingStatsDto } from './dto/tennis-venue-rating.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './decorators/user.decorator';
import { API_CODE } from '../common/constants';

@ApiTags('网球场馆')
@Controller('tennis-venues')
export class TennisVenueController {
  private readonly logger = new Logger(TennisVenueController.name);

  constructor(
    private readonly tennisVenueService: TennisVenueService,
    private readonly venueRatingService: TennisVenueRatingService,
    private readonly wechatService: WechatService,
  ) { }

  @Get()
  @ApiOperation({
    summary: '获取网球场馆列表',
    description: '分页获取网球场馆列表，支持城市、预订方式、营业状态等筛选条件，包含平均评分和评分人数'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: TennisVenueListResponseDto,
  })
  async getVenues(@Query() queryDto: QueryTennisVenueDto): Promise<any> {
    try {
      const result: any = await this.tennisVenueService.getVenues(queryDto);

      // 获取场馆评分统计
      const venueIds = result.list.map((venue: any) => venue.id);
      const ratingsMap = await this.venueRatingService.getVenuesRatingStats(venueIds);

      // 为每个场馆添加评分信息
      const venuesWithRating = result.list.map((venue: any) => {
        const ratingStats = ratingsMap.get(venue.id);
        return {
          ...venue.toJSON(),
          averageRating: ratingStats?.averageRating || 0,
          totalRatings: ratingStats?.totalRatings || 0,
        };
      });

      return {
        code: API_CODE.SUCCESS,
        message: '获取场馆列表成功',
        data: {
          ...result,
          list: venuesWithRating,
        },
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

  @Get(':id')
  @ApiOperation({
    summary: '获取场馆详情',
    description: '根据场馆ID获取详细信息，包含平均评分和评分人数'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: TennisVenueDto,
  })
  async getVenueById(@Param('id') id: number): Promise<any> {
    try {
      const venue = await this.tennisVenueService.getVenueById(id);
      const ratingStats = await this.venueRatingService.getVenueRatingStats(id);

      return {
        code: API_CODE.SUCCESS,
        message: '获取场馆详情成功',
        data: {
          ...venue,
          averageRating: ratingStats.averageRating,
          totalRatings: ratingStats.totalRatings,
          ratingDistribution: ratingStats.ratingDistribution,
        },
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

  @Get('popular/list')
  @ApiOperation({
    summary: '获取热门场馆',
    description: '获取热门推荐的网球场馆列表，包含平均评分和评分人数'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [TennisVenueDto],
  })
  async getPopularVenues(@Query('limit') limit?: number): Promise<any> {
    try {
      const venues = await this.tennisVenueService.getPopularVenues(limit || 10);

      // 获取场馆评分统计
      const venueIds = venues.map((venue: any) => venue.id);
      const ratingsMap = await this.venueRatingService.getVenuesRatingStats(venueIds);

      // 为每个场馆添加评分信息
      const venuesWithRating = venues.map((venue: any) => {
        const ratingStats = ratingsMap.get(venue.id);
        return {
          ...venue.toJSON(),
          averageRating: ratingStats?.averageRating || 0,
          totalRatings: ratingStats?.totalRatings || 0,
        };
      });

      return {
        code: API_CODE.SUCCESS,
        message: '获取热门场馆成功',
        data: venuesWithRating,
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

  @Get('search/keyword')
  @ApiOperation({
    summary: '搜索场馆',
    description: '根据关键词搜索网球场馆，包含平均评分和评分人数'
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
      const venues = await this.tennisVenueService.searchVenues(keyword, limit || 20);

      // 获取场馆评分统计
      const venueIds = venues.map((venue: any) => venue.id);
      const ratingsMap = await this.venueRatingService.getVenuesRatingStats(venueIds);

      // 为每个场馆添加评分信息
      const venuesWithRating = venues.map((venue: any) => {
        const ratingStats = ratingsMap.get(venue.id);
        return {
          ...venue.toJSON(),
          averageRating: ratingStats?.averageRating || 0,
          totalRatings: ratingStats?.totalRatings || 0,
        };
      });

      return {
        code: API_CODE.SUCCESS,
        message: '搜索场馆成功',
        data: venuesWithRating,
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

  @Get('cities/available')
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

  // 评分相关接口

  @Post(':id/ratings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '创建场馆评分',
    description: '用户对场馆进行评分和评价'
  })
  @ApiResponse({
    status: 201,
    description: '评分成功',
    type: VenueRatingDto,
  })
  @ApiBadRequestResponse({
    description: '评分失败',
  })
  async createRating(@Param('id') venueId: number, @Body() createDto: CreateVenueRatingDto, @User() user: any): Promise<any> {
    try {
      const userInfo = await this.wechatService.getUserByOpenid(user.openid);
      if (!userInfo) {
        throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
      }

      // 设置场馆ID
      createDto.venueId = venueId;

      const rating = await this.venueRatingService.createRating(userInfo.id, createDto);

      return {
        code: API_CODE.SUCCESS,
        message: '评分成功',
        data: rating,
      };
    } catch (error) {
      this.logger.error('createRating error', error);
      return {
        code: API_CODE.SYSTEM_ERROR,
        message: error.message || '评分失败',
        data: null,
      };
    }
  }

  @Put('ratings/:ratingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '更新场馆评分',
    description: '用户更新自己的场馆评分'
  })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: VenueRatingDto,
  })
  @ApiBadRequestResponse({
    description: '更新失败',
  })
  async updateRating(@Param('ratingId') ratingId: number, @Body() updateDto: UpdateVenueRatingDto, @User() user: any): Promise<any> {
    try {
      const userInfo = await this.wechatService.getUserByOpenid(user.openid);
      if (!userInfo) {
        throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
      }

      const rating = await this.venueRatingService.updateRating(userInfo.id, ratingId, updateDto);

      return {
        code: API_CODE.SUCCESS,
        message: '更新评分成功',
        data: rating,
      };
    } catch (error) {
      this.logger.error('updateRating error', error);
      return {
        code: API_CODE.SYSTEM_ERROR,
        message: error.message || '更新评分失败',
        data: null,
      };
    }
  }

  @Delete('ratings/:ratingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '删除场馆评分',
    description: '用户删除自己的场馆评分'
  })
  @ApiResponse({
    status: 204,
    description: '删除成功',
  })
  async deleteRating(@Param('ratingId') ratingId: number, @User() user: any): Promise<any> {
    try {
      const userInfo = await this.wechatService.getUserByOpenid(user.openid);
      if (!userInfo) {
        throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
      }

      await this.venueRatingService.deleteRating(userInfo.id, ratingId);

      return {
        code: API_CODE.SUCCESS,
        message: '删除评分成功',
        data: null,
      };
    } catch (error) {
      this.logger.error('deleteRating error', error);
      return {
        code: API_CODE.SYSTEM_ERROR,
        message: error.message || '删除评分失败',
        data: null,
      };
    }
  }

  @Get(':id/ratings')
  @ApiOperation({
    summary: '获取场馆评分列表',
    description: '获取指定场馆的评分列表'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: [VenueRatingDto],
  })
  async getVenueRatings(@Param('id') venueId: number, @Query() queryDto: QueryVenueRatingDto): Promise<any> {
    try {
      const result = await this.venueRatingService.getVenueRatings(venueId, queryDto);

      return {
        code: API_CODE.SUCCESS,
        message: '获取评分列表成功',
        data: result,
      };
    } catch (error) {
      this.logger.error('getVenueRatings error', error);
      return {
        code: API_CODE.SYSTEM_ERROR,
        message: error.message || '获取评分列表失败',
        data: null,
      };
    }
  }

  @Get(':id/ratings/stats')
  @ApiOperation({
    summary: '获取场馆评分统计',
    description: '获取指定场馆的评分统计信息'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: VenueRatingStatsDto,
  })
  async getVenueRatingStats(@Param('id') venueId: number): Promise<any> {
    try {
      const stats = await this.venueRatingService.getVenueRatingStats(venueId);

      return {
        code: API_CODE.SUCCESS,
        message: '获取评分统计成功',
        data: stats,
      };
    } catch (error) {
      this.logger.error('getVenueRatingStats error', error);
      return {
        code: API_CODE.SYSTEM_ERROR,
        message: error.message || '获取评分统计失败',
        data: null,
      };
    }
  }

  @Get(':id/ratings/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取我对场馆的评分',
    description: '获取当前用户对指定场馆的评分'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: VenueRatingDto,
  })
  async getMyRatingForVenue(@Param('id') venueId: number, @User() user: any): Promise<any> {
    try {
      const userInfo = await this.wechatService.getUserByOpenid(user.openid);
      if (!userInfo) {
        throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
      }

      const rating = await this.venueRatingService.getUserRatingForVenue(userInfo.id, venueId);

      return {
        code: API_CODE.SUCCESS,
        message: rating ? '获取评分成功' : '您还未评分该场馆',
        data: rating,
      };
    } catch (error) {
      this.logger.error('getMyRatingForVenue error', error);
      return {
        code: API_CODE.SYSTEM_ERROR,
        message: error.message || '获取评分失败',
        data: null,
      };
    }
  }
} 