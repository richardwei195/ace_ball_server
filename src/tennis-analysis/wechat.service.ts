import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import axios from 'axios';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { WechatLoginDto, WechatUserInfoDto, WechatAuthResponseDto, UserProfileDto } from './dto/wechat-auth.dto';
import { User } from './models/user.model';

interface WechatSession {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

interface DecryptedUserInfo {
  openId: string;
  nickName: string;
  gender: number;
  city: string;
  province: string;
  country: string;
  avatarUrl: string;
  unionId?: string;
  language: string;
  watermark: {
    timestamp: number;
    appid: string;
  };
}

@Injectable()
export class WechatService {
  private readonly logger = new Logger(WechatService.name);
  private readonly appId: string;
  private readonly appSecret: string;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    @InjectModel(User)
    private userModel: typeof User,
  ) {
    this.appId = this.configService.get<string>('WECHAT_APPID') || '';
    this.appSecret = this.configService.get<string>('WECHAT_APP_SECRET') || '';

    if (!this.appId || !this.appSecret) {
      throw new Error('WECHAT_APPID and WECHAT_APP_SECRET environment variables are required');
    }
  }

  /**
   * 微信小程序登录
   */
  async login(loginDto: WechatLoginDto): Promise<WechatAuthResponseDto> {
    try {
      this.logger.log(`微信小程序登录开始，code: ${loginDto.code}`);

      // 调用微信接口获取session
      const session = await this.getWechatSession(loginDto.code);

      if (session.errcode) {
        throw new BadRequestException(`微信登录失败: ${session.errmsg}`);
      }

      console.log('login session', session);

      // 生成JWT token
      const payload = {
        openid: session.openid,
        unionid: session.unionid,
        sessionKey: session.session_key,
      };

      const accessToken = this.jwtService.sign(payload, {
        expiresIn: '7d', // 7天过期
      });

      // 保存或更新用户信息到数据库
      const user = await this.saveOrUpdateUser(session, loginDto);

      console.log('login user', user);

      const response: WechatAuthResponseDto = {
        openid: session.openid,
        unionid: session.unionid,
        accessToken,
        avatarUrl: user.avatar,
        nickName: user.name,
      };

      this.logger.log(`微信小程序登录成功，openid: ${session.openid}`);
      return response;

    } catch (error) {
      this.logger.error(`微信小程序登录失败: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`登录失败: ${error.message}`);
    }
  }

  /**
   * 验证JWT token
   */
  async verifyToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token验证失败');
    }
  }

  /**
   * 刷新token
   */
  async refreshToken(oldToken: string): Promise<string> {
    try {
      const payload = this.jwtService.verify(oldToken);

      // 生成新的token
      const newPayload = {
        openid: payload.openid,
        unionid: payload.unionid,
        sessionKey: payload.sessionKey,
      };

      return this.jwtService.sign(newPayload, {
        expiresIn: '7d',
      });
    } catch (error) {
      throw new UnauthorizedException('Token刷新失败');
    }
  }

  /**
   * 调用微信接口获取session
   */
  private async getWechatSession(code: string): Promise<WechatSession> {
    const url = 'https://api.weixin.qq.com/sns/jscode2session';
    const params = {
      appid: this.appId,
      secret: this.appSecret,
      js_code: code,
      grant_type: 'authorization_code',
    };

    try {
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      this.logger.error(`调用微信接口失败: ${error.message}`);
      throw new BadRequestException('调用微信接口失败');
    }
  }

  /**
   * 解密微信用户数据
   */
  private decryptData(encryptedData: string, sessionKey: string, iv: string): string {
    try {
      const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
      const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
      const ivBuffer = Buffer.from(iv, 'base64');

      const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);
      decipher.setAutoPadding(true);

      let decrypted = decipher.update(encryptedDataBuffer, undefined, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error(`解密用户数据失败: ${error.message}`);
      throw new BadRequestException('解密用户数据失败');
    }
  }

  /**
   * 生成数据签名
   */
  private generateSignature(data: any, sessionKey: string): string {
    const sortedKeys = Object.keys(data).sort();
    const stringA = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
    const stringSignTemp = `${stringA}&key=${sessionKey}`;

    return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
  }

  /**
   * 验证数据签名
   */
  verifySignature(data: any, signature: string, sessionKey: string): boolean {
    const expectedSignature = this.generateSignature(data, sessionKey);
    return expectedSignature === signature;
  }

  /**
   * 保存或更新用户基本信息（登录时）
   */
  private async saveOrUpdateUser(session: WechatSession, loginDto: WechatLoginDto): Promise<User> {
    try {
      const [user, created] = await this.userModel.findOrCreate({
        where: { openid: session.openid },
        defaults: {
          id: uuidv4(),
          openid: session.openid,
          unionid: session.unionid,
          sessionKey: session.session_key,
          name: loginDto.nickName || '网球用户',
          avatar: loginDto.avatarUrl || 'https://tennis-1251306435.cos.ap-nanjing.myqcloud.com/images/home/avatar_default.png',
          lastLoginAt: new Date(),
        },
      });

      if (!created) {
        // 更新现有用户信息
        await user.update({
          unionid: session.unionid,
          sessionKey: session.session_key,
          name: loginDto.nickName || user.name,
          avatar: loginDto.avatarUrl || user.avatar,
          lastLoginAt: new Date(),
        });
      }

      user.isNew = created;
      this.logger.log(`用户${created ? '创建' : '更新'}成功，openid: ${session.openid}`);
      return user;

    } catch (error) {
      this.logger.error(`保存用户信息失败: ${error.message}`, error.stack);
      throw new BadRequestException('保存用户信息失败');
    }
  }

  /**
   * 保存或更新用户详细信息（获取用户信息时）
   */
  private async saveOrUpdateUserInfo(userInfo: DecryptedUserInfo, session: WechatSession): Promise<User> {
    try {
      const [user, created] = await this.userModel.findOrCreate({
        where: { openid: userInfo.openId },
        defaults: {
          id: uuidv4(),
          openid: userInfo.openId,
          unionid: userInfo.unionId,
          sessionKey: session.session_key,
          name: userInfo.nickName,
          avatar: userInfo.avatarUrl || 'https://tennis-1251306435.cos.ap-nanjing.myqcloud.com/images/home/avatar_default.png',
          gender: userInfo.gender === 1 ? 'male' : userInfo.gender === 2 ? 'female' : null,
          city: userInfo.city,
          province: userInfo.province,
          country: userInfo.country,
          language: userInfo.language,
          lastLoginAt: new Date(),
        },
      });

      if (!created) {
        // 更新现有用户详细信息
        await user.update({
          unionid: userInfo.unionId,
          sessionKey: session.session_key,
          name: userInfo.nickName,
          avatar: userInfo.avatarUrl,
          gender: userInfo.gender === 1 ? 'male' : userInfo.gender === 2 ? 'female' : user.gender,
          city: userInfo.city,
          province: userInfo.province,
          country: userInfo.country,
          language: userInfo.language,
          lastLoginAt: new Date(),
        });
      }

      this.logger.log(`用户详细信息${created ? '创建' : '更新'}成功，openid: ${userInfo.openId}`);
      return user;

    } catch (error) {
      this.logger.error(`保存用户详细信息失败: ${error.message}`, error.stack);
      throw new BadRequestException('保存用户详细信息失败');
    }
  }

  /**
   * 根据openid获取用户信息
   */
  async getUserByOpenid(openid: string): Promise<User | null> {
    try {
      return await this.userModel.findOne({
        where: { openid },
      });
    } catch (error) {
      this.logger.error(`获取用户信息失败: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * 更新用户信息
   */
  async updateUserProfile(openid: string, updateData: any): Promise<User> {
    try {
      const user = await this.userModel.findOne({
        where: { openid },
      });

      if (!user) {
        throw new BadRequestException('用户不存在');
      }

      // 构建更新数据对象
      const updateFields: any = {};

      if (updateData.name !== undefined) {
        updateFields.name = updateData.name;
      }

      if (updateData.avatar !== undefined) {
        updateFields.avatar = updateData.avatar;
      }

      if (updateData.gender !== undefined) {
        updateFields.gender = updateData.gender;
      }

      if (updateData.ntrpRating !== undefined) {
        updateFields.ntrpRating = updateData.ntrpRating;
      }

      if (updateData.dominantHand !== undefined) {
        updateFields.dominantHand = updateData.dominantHand;
      }

      if (updateData.tennisExperience !== undefined) {
        // 验证网球经验是否为0.5的倍数
        if (updateData.tennisExperience % 0.5 !== 0) {
          throw new BadRequestException('网球经验必须是0.5年的倍数');
        }
        updateFields.tennisExperience = updateData.tennisExperience;
      }

      // 更新用户信息
      await user.update(updateFields);

      this.logger.log(`用户信息更新成功，openid: ${openid}`);
      return user;

    } catch (error) {
      this.logger.error(`更新用户信息失败: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('更新用户信息失败');
    }
  }
} 