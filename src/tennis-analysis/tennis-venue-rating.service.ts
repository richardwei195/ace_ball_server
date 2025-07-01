import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { TennisVenueRating } from './models/tennis-venue-rating.model';
import { TennisVenue } from './models/tennis-venue.model';
import { User } from './models/user.model';
import { CreateVenueRatingDto, UpdateVenueRatingDto, QueryVenueRatingDto, VenueRatingStatsDto } from './dto/tennis-venue-rating.dto';

@Injectable()
export class TennisVenueRatingService {
  private readonly logger = new Logger(TennisVenueRatingService.name);

  constructor(
    @InjectModel(TennisVenueRating)
    private venueRatingModel: typeof TennisVenueRating,
    @InjectModel(TennisVenue)
    private venueModel: typeof TennisVenue,
  ) { }

  /**
   * 创建场馆评分
   */
  async createRating(userId: string, createDto: CreateVenueRatingDto): Promise<TennisVenueRating> {
    try {
      // 检查场馆是否存在
      const venue = await this.venueModel.findByPk(createDto.venueId);
      if (!venue) {
        throw new NotFoundException('场馆不存在');
      }

      // 检查用户是否已经评分过
      const existingRating = await this.venueRatingModel.findOne({
        where: {
          userId,
          venueId: createDto.venueId,
        },
      });

      if (existingRating) {
        throw new BadRequestException('您已经评分过该场馆，请使用更新功能修改评分');
      }

      // 创建评分
      const rating = await this.venueRatingModel.create({
        userId,
        venueId: createDto.venueId,
        rating: createDto.rating,
        description: createDto.description,
      });

      this.logger.log(`用户 ${userId} 为场馆 ${createDto.venueId} 创建评分成功`);
      return rating;

    } catch (error) {
      this.logger.error(`创建场馆评分失败: ${error.message}`, error.stack);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('创建评分失败');
    }
  }

  /**
   * 更新场馆评分
   */
  async updateRating(userId: string, ratingId: number, updateDto: UpdateVenueRatingDto): Promise<TennisVenueRating> {
    try {
      const rating = await this.venueRatingModel.findOne({
        where: {
          id: ratingId,
          userId,
        },
      });

      if (!rating) {
        throw new NotFoundException('评分不存在或无权限修改');
      }

      await rating.update(updateDto);

      this.logger.log(`用户 ${userId} 更新评分 ${ratingId} 成功`);
      return rating;

    } catch (error) {
      this.logger.error(`更新场馆评分失败: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('更新评分失败');
    }
  }

  /**
   * 删除场馆评分
   */
  async deleteRating(userId: string, ratingId: number): Promise<void> {
    try {
      const rating = await this.venueRatingModel.findOne({
        where: {
          id: ratingId,
          userId,
        },
      });

      if (!rating) {
        throw new NotFoundException('评分不存在或无权限删除');
      }

      await rating.destroy();

      this.logger.log(`用户 ${userId} 删除评分 ${ratingId} 成功`);

    } catch (error) {
      this.logger.error(`删除场馆评分失败: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('删除评分失败');
    }
  }

  /**
   * 获取场馆评分列表
   */
  async getVenueRatings(venueId: number, queryDto: QueryVenueRatingDto): Promise<any> {
    try {
      const { page = 1, limit = 10, rating } = queryDto;
      const offset = (page - 1) * limit;

      const whereCondition: any = { venueId };
      if (rating) {
        whereCondition.rating = rating;
      }

      const { count, rows } = await this.venueRatingModel.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'avatar'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return {
        list: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };

    } catch (error) {
      this.logger.error(`获取场馆评分列表失败: ${error.message}`, error.stack);
      throw new BadRequestException('获取评分列表失败');
    }
  }

  /**
   * 获取场馆评分统计
   */
  async getVenueRatingStats(venueId: number): Promise<VenueRatingStatsDto> {
    try {
      const ratings = await this.venueRatingModel.findAll({
        where: { venueId },
        attributes: ['rating'],
      });

      if (ratings.length === 0) {
        return {
          averageRating: 0,
          totalRatings: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
      }

      // 计算平均评分
      const totalScore = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const averageRating = Math.round((totalScore / ratings.length) * 10) / 10;

      // 计算各星级分布
      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach(rating => {
        ratingDistribution[rating.rating as keyof typeof ratingDistribution]++;
      });

      return {
        averageRating,
        totalRatings: ratings.length,
        ratingDistribution,
      };

    } catch (error) {
      this.logger.error(`获取场馆评分统计失败: ${error.message}`, error.stack);
      throw new BadRequestException('获取评分统计失败');
    }
  }

  /**
   * 获取用户对场馆的评分
   */
  async getUserRatingForVenue(userId: string, venueId: number): Promise<TennisVenueRating | null> {
    try {
      return await this.venueRatingModel.findOne({
        where: {
          userId,
          venueId,
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'avatar'],
          },
        ],
      });

    } catch (error) {
      this.logger.error(`获取用户评分失败: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * 批量获取场馆评分统计（用于场馆列表）
   */
  async getVenuesRatingStats(venueIds: number[]): Promise<Map<number, VenueRatingStatsDto>> {
    try {
      const ratingsMap = new Map<number, VenueRatingStatsDto>();

      // 初始化所有场馆的评分统计
      venueIds.forEach(venueId => {
        ratingsMap.set(venueId, {
          averageRating: 0,
          totalRatings: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
      });

      // 获取所有相关评分
      const ratings = await this.venueRatingModel.findAll({
        where: {
          venueId: {
            [Op.in]: venueIds,
          },
        },
        attributes: ['venueId', 'rating'],
      });

      // 按场馆分组统计
      const venueRatingsGroup = new Map<number, number[]>();
      ratings.forEach(rating => {
        if (!venueRatingsGroup.has(rating.venueId)) {
          venueRatingsGroup.set(rating.venueId, []);
        }
        venueRatingsGroup.get(rating.venueId)!.push(rating.rating);
      });

      // 计算每个场馆的统计
      venueRatingsGroup.forEach((venueRatings, venueId) => {
        if (venueRatings.length > 0) {
          const totalScore = venueRatings.reduce((sum, rating) => sum + rating, 0);
          const averageRating = Math.round((totalScore / venueRatings.length) * 10) / 10;

          const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          venueRatings.forEach(rating => {
            ratingDistribution[rating as keyof typeof ratingDistribution]++;
          });

          ratingsMap.set(venueId, {
            averageRating,
            totalRatings: venueRatings.length,
            ratingDistribution,
          });
        }
      });

      return ratingsMap;

    } catch (error) {
      this.logger.error(`批量获取场馆评分统计失败: ${error.message}`, error.stack);
      return new Map();
    }
  }
} 