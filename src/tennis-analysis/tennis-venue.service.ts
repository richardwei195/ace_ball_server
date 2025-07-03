import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize, Transaction } from 'sequelize';
import { TennisVenue } from './models/tennis-venue.model';
import { TennisVenueBookingMethod, BookingMethodType } from './models/tennis-venue-booking-method.model';
import {
  QueryTennisVenueDto,
  TennisVenueDto,
  TennisVenueListResponseDto,
  BookingMethodDto,
  CreateTennisVenueDto,
  CreateBookingMethodDto
} from './dto/tennis-venue.dto';
import { API_CODE } from '../common/constants';

@Injectable()
export class TennisVenueService {
  private readonly logger = new Logger(TennisVenueService.name);

  constructor(
    @InjectModel(TennisVenue)
    private readonly tennisVenueModel: typeof TennisVenue,
    @InjectModel(TennisVenueBookingMethod)
    private readonly bookingMethodModel: typeof TennisVenueBookingMethod,
  ) { }

  /**
   * 获取网球场馆列表
   */
  async getVenues(queryDto: QueryTennisVenueDto): Promise<TennisVenueListResponseDto> {
    try {
      this.logger.log(`获取网球场馆列表，查询参数: ${JSON.stringify(queryDto)}`);

      const {
        page = 1,
        limit = 10,
        city,
        bookingTypes,
        isOpen,
        keyword,
        openStartTimeBefore,
        openEndTimeAfter,
        features
      } = queryDto;
      const offset = (page - 1) * limit;

      // 构建主查询条件
      const whereConditions: any = {};

      if (city) {
        whereConditions.city = city;
      }

      if (isOpen !== undefined) {
        whereConditions.isOpen = isOpen;
      }

      if (keyword) {
        whereConditions[Op.or] = [
          { name: { [Op.like]: `%${keyword}%` } },
          { location: { [Op.like]: `%${keyword}%` } },
          { description: { [Op.like]: `%${keyword}%` } }
        ];
      }

      // 营业时间筛选 - 使用整型比较，更简单高效
      if (openStartTimeBefore) {
        const minutesBefore = TennisVenue.timeToMinutes(openStartTimeBefore);
        whereConditions.openStartTime = { [Op.lte]: minutesBefore };
      }

      if (openEndTimeAfter) {
        const minutesAfter = TennisVenue.timeToMinutes(openEndTimeAfter);
        whereConditions.openEndTime = { [Op.gte]: minutesAfter };
      }

      // 特色服务筛选 - 场馆需包含所有指定的特色服务
      if (features) {
        // 将逗号分隔的字符串转换为数组
        const featureArray = features.split(',').map(f => f.trim()).filter(f => f.length > 0);

        if (featureArray.length > 0) {
          // 使用 JSON_CONTAINS 进行数组匹配（适用于MySQL/PostgreSQL）
          // 对于每个指定的特色，都必须存在于场馆的 features 数组中
          const featureConditions = featureArray.map(feature =>
            Sequelize.where(
              Sequelize.fn('JSON_CONTAINS', Sequelize.col('features'), JSON.stringify(feature)),
              1
            )
          );

          // 所有特色都必须匹配
          whereConditions[Op.and] = whereConditions[Op.and] || [];
          whereConditions[Op.and] = whereConditions[Op.and].concat(featureConditions);
        }
      }

      // 构建预订方式筛选条件
      let bookingMethodInclude: any = {
        model: this.bookingMethodModel,
        as: 'bookingMethods',
        where: { isEnabled: true },
        required: false,
      };

      if (bookingTypes && bookingTypes.length > 0) {
        bookingMethodInclude.where.type = { [Op.in]: bookingTypes };
        bookingMethodInclude.required = true; // 必须有匹配的预订方式
      }

      const { count, rows } = await this.tennisVenueModel.findAndCountAll({
        where: whereConditions,
        include: [bookingMethodInclude],
        order: [
          ['sortOrder', 'DESC'],
          ['createdAt', 'DESC']
        ],
        limit,
        offset,
        distinct: true, // 避免因为join导致的重复计数
      });

      // 如果按预订方式筛选，需要过滤掉没有匹配预订方式的场馆
      let filteredRows = rows;
      if (bookingTypes && bookingTypes.length > 0) {
        filteredRows = rows.filter(venue =>
          venue.bookingMethods && venue.bookingMethods.length > 0
        );
      }

      const totalPages = Math.ceil(count / limit);

      // 获取所有可用城市
      const availableCities = await this.getAvailableCities();

      const result: TennisVenueListResponseDto = {
        data: filteredRows.map(venue => this.formatVenueResponse(venue)),
        total: count,
        page,
        limit,
        totalPages,
        availableCities,
      };

      this.logger.log(`获取网球场馆列表成功，共 ${count} 条记录`);
      return result;

    } catch (error) {
      this.logger.error(`获取网球场馆列表失败: ${error.message}`, error.stack);
      throw new HttpException('获取场馆列表失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 根据ID获取场馆详情
   */
  async getVenueById(id: number): Promise<TennisVenueDto> {
    try {
      this.logger.log(`获取场馆详情，ID: ${id}`);

      const venue = await this.tennisVenueModel.findByPk(id, {
        include: [
          {
            model: this.bookingMethodModel,
            as: 'bookingMethods',
            where: { isEnabled: true },
            required: false,
            order: [['sortOrder', 'ASC']],
          }
        ],
      });

      if (!venue) {
        throw new HttpException('场馆不存在', HttpStatus.NOT_FOUND);
      }

      const result = this.formatVenueResponse(venue);
      this.logger.log(`获取场馆详情成功，场馆: ${venue.name}`);
      return result;

    } catch (error) {
      this.logger.error(`获取场馆详情失败: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('获取场馆详情失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 创建场馆
   */
  async createVenue(createDto: CreateTennisVenueDto): Promise<TennisVenueDto> {
    const transaction = await this.tennisVenueModel?.sequelize?.transaction();

    try {
      this.logger.log(`创建场馆，数据: ${JSON.stringify(createDto)}`);

      const { bookingMethods, ...venueData } = createDto;

      // 将时间字符串转换为分钟
      const processedVenueData = {
        ...venueData,
        openStartTime: createDto.openStartTime ? TennisVenue.timeToMinutes(createDto.openStartTime) : null,
        openEndTime: createDto.openEndTime ? TennisVenue.timeToMinutes(createDto.openEndTime) : null,
        isOpen: false,
      };

      // 创建场馆
      const venue = await this.tennisVenueModel.create(processedVenueData, { transaction });

      // 如果有预订方式，则同时创建
      if (bookingMethods && bookingMethods.length > 0) {
        const bookingMethodsData = bookingMethods.map((method, index) => ({
          venueId: venue.id,
          ...method,
          isEnabled: false,
        }));

        await this.bookingMethodModel.bulkCreate(bookingMethodsData, { transaction });
      }

      await transaction?.commit();

      // 重新查询获取完整数据（包含预订方式）
      const createdVenue = await this.tennisVenueModel.findByPk(venue.id, {
        include: [
          {
            model: this.bookingMethodModel,
            as: 'bookingMethods',
            where: { isEnabled: true },
            required: false,
          }
        ],
      });

      const result = this.formatVenueResponse(createdVenue);
      this.logger.log(`创建场馆成功，ID: ${venue.id}`);
      return result;

    } catch (error) {
      await transaction?.rollback();
      this.logger.error(`创建场馆失败: ${error.message}`, error.stack);
      throw new HttpException('创建场馆失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 为场馆添加预订方式
   */
  async addBookingMethod(venueId: number, createDto: CreateBookingMethodDto): Promise<BookingMethodDto> {
    try {
      this.logger.log(`为场馆 ${venueId} 添加预订方式: ${JSON.stringify(createDto)}`);

      // 验证场馆是否存在
      const venue = await this.tennisVenueModel.findByPk(venueId);
      if (!venue) {
        throw new HttpException('场馆不存在', HttpStatus.NOT_FOUND);
      }

      const bookingMethod = await this.bookingMethodModel.create({
        venueId,
        ...createDto,
        isEnabled: createDto.isEnabled !== undefined ? createDto.isEnabled : true,
        sortOrder: createDto.sortOrder || 0,
      });

      const result = this.formatBookingMethodResponse(bookingMethod);
      this.logger.log(`添加预订方式成功，ID: ${bookingMethod.id}`);
      return result;

    } catch (error) {
      this.logger.error(`添加预订方式失败: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('添加预订方式失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 获取所有可用城市
   */
  async getAvailableCities(): Promise<string[]> {
    try {
      const cities = await this.tennisVenueModel.findAll({
        attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('city')), 'city']],
        where: { isOpen: true },
        order: [['city', 'ASC']],
        raw: true,
      });

      return cities.map(item => item.city).filter(Boolean);

    } catch (error) {
      this.logger.error(`获取可用城市失败: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * 获取热门场馆
   */
  async getPopularVenues(limit: number = 10): Promise<TennisVenueDto[]> {
    try {
      this.logger.log(`获取热门场馆，限制数量: ${limit}`);

      const venues = await this.tennisVenueModel.findAll({
        where: { isOpen: true },
        include: [
          {
            model: this.bookingMethodModel,
            as: 'bookingMethods',
            where: { isEnabled: true },
            required: false,
          }
        ],
        order: [
          ['sortOrder', 'DESC'],
          ['createdAt', 'DESC']
        ],
        limit,
      });

      const result = venues.map(venue => this.formatVenueResponse(venue));
      this.logger.log(`获取热门场馆成功，共 ${venues.length} 个场馆`);
      return result;

    } catch (error) {
      this.logger.error(`获取热门场馆失败: ${error.message}`, error.stack);
      throw new HttpException('获取热门场馆失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 搜索场馆
   */
  async searchVenues(keyword: string, limit: number = 20): Promise<TennisVenueDto[]> {
    try {
      this.logger.log(`搜索场馆，关键词: ${keyword}`);

      if (!keyword || keyword.trim().length === 0) {
        return [];
      }

      const venues = await this.tennisVenueModel.findAll({
        where: {
          [Op.and]: [
            { isOpen: true },
            {
              [Op.or]: [
                { name: { [Op.like]: `%${keyword}%` } },
                { city: { [Op.like]: `%${keyword}%` } },
                { location: { [Op.like]: `%${keyword}%` } },
                { description: { [Op.like]: `%${keyword}%` } }
              ]
            }
          ]
        },
        include: [
          {
            model: this.bookingMethodModel,
            as: 'bookingMethods',
            where: { isEnabled: true },
            required: false,
          }
        ],
        order: [
          ['sortOrder', 'DESC'],
          ['name', 'ASC']
        ],
        limit,
      });

      const result = venues.map(venue => this.formatVenueResponse(venue));
      this.logger.log(`搜索场馆成功，找到 ${venues.length} 个匹配场馆`);
      return result;

    } catch (error) {
      this.logger.error(`搜索场馆失败: ${error.message}`, error.stack);
      throw new HttpException('搜索场馆失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 格式化场馆响应数据
   */
  private formatVenueResponse(venue: any): TennisVenueDto {
    return {
      id: venue.id,
      name: venue.name,
      city: venue.city,
      location: venue.location,
      openStartTime: venue.openStartTimeFormatted,
      openEndTime: venue.openEndTimeFormatted,
      bookingStartTime: venue.bookingStartTime,
      openTime: venue.openTime,
      isOpen: venue.isOpen,
      priceRange: venue.priceRange,
      features: venue.features || [],
      description: venue.description,
      imageUrl: venue.imageUrl,
      bookingMethods: venue.bookingMethods ?
        venue.bookingMethods
          .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
          .map((method: any) => this.formatBookingMethodResponse(method)) : [],
      createdAt: venue.createdAt,
      updatedAt: venue.updatedAt,
    };
  }

  /**
   * 格式化预订方式响应数据
   */
  private formatBookingMethodResponse(method: any): BookingMethodDto {
    const result: BookingMethodDto = {
      type: method.type,
      name: method.name,
      icon: method.icon,
      color: method.color,
    };

    // 根据类型添加相应字段
    switch (method.type) {
      case BookingMethodType.H5:
      case BookingMethodType.APP:
      case BookingMethodType.MINIPROGRAM:
        if (method.url) result.url = method.url;
        break;
      case BookingMethodType.PHONE:
        if (method.phone) result.phone = method.phone;
        break;
    }

    return result;
  }
} 