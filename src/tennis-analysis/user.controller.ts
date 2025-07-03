import { Controller, Get, Param, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { WechatService } from './wechat.service';
import { TennisVenueRatingService } from './tennis-venue-rating.service';
import { API_CODE } from '../common/constants';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('用户信息')
@Controller('tennis-analysis/users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly wechatService: WechatService,
    private readonly venueRatingService: TennisVenueRatingService,
  ) { }

  @Get(':userId/profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '获取用户公开信息',
    description: '根据用户ID获取用户的公开信息，包括头像、姓名、惯用手、网球经验、打卡场地数量和NTRP评分'
  })
  @ApiParam({
    name: 'userId',
    description: '用户ID',
    type: 'string',
    example: 'user123'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        message: { type: 'string', example: '获取用户信息成功' },
        data: {
          type: 'object',
          properties: {
            avatar: { type: 'string', example: 'https://example.com/avatar.jpg', description: '用户头像' },
            name: { type: 'string', example: '张三', description: '用户姓名' },
            dominantHand: { type: 'string', example: 'right', description: '惯用手', enum: ['left', 'right', 'unknown'] },
            tennisExperience: { type: 'number', example: 2.5, description: '网球经验年限' },
            checkedInVenuesCount: { type: 'number', example: 8, description: '已打卡的场地数量' },
            ntrpRating: { type: 'number', example: 4.0, description: 'NTRP评分' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: '用户不存在'
  })
  async getUserProfile(@Param('userId') userId: string): Promise<any> {
    try {
      // 获取用户信息
      const userInfo = await this.wechatService.getUserById(userId);
      if (!userInfo) {
        return {
          code: API_CODE.SYSTEM_ERROR,
          message: '用户不存在',
          data: null,
        };
      }

      // 获取用户已打卡的场地数量
      const checkedInVenuesCount = await this.venueRatingService.getUserCheckedInVenuesCount(userId);

      // 只返回需要的字段
      const publicUserInfo = {
        avatar: userInfo.avatar,
        name: userInfo.name,
        dominantHand: userInfo.dominantHand,
        tennisExperience: userInfo.tennisExperience,
        checkedInVenuesCount,
        ntrpRating: userInfo.ntrpRating,
        id: userInfo.id,
      };

      return {
        code: API_CODE.SUCCESS,
        message: '获取用户信息成功',
        data: publicUserInfo,
      };
    } catch (error) {
      this.logger.error('getUserProfile error', error);
      return {
        code: API_CODE.SYSTEM_ERROR,
        message: error.message || '获取用户信息失败',
        data: null,
      };
    }
  }
} 