import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;

  constructor(private configService: ConfigService) {
    this.initializeRedisClient();
  }

  private async initializeRedisClient() {
    this.client = createClient({
      socket: {
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
      },
      password: this.configService.get<string>('REDIS_PASSWORD'),
      database: this.configService.get<number>('REDIS_DB', 0),
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis客户端错误:', err);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis客户端已连接');
    });

    try {
      await this.client.connect();
      this.logger.log('Redis连接成功');
    } catch (error) {
      this.logger.error('Redis连接失败:', error);
    }
  }

  /**
   * 获取分布式锁
   * @param key 锁的键名
   * @param ttl 锁的过期时间（秒）
   * @param value 锁的值（通常是唯一标识符）
   * @returns 是否成功获取锁
   */
  async acquireLock(key: string, ttl: number = 300, value: string = 'locked'): Promise<boolean> {
    try {
      const result = await this.client.set(key, value, {
        NX: true, // 只在键不存在时设置
        EX: ttl,  // 设置过期时间
      });
      return result === 'OK';
    } catch (error) {
      this.logger.error(`获取锁失败 ${key}:`, error);
      return false;
    }
  }

  /**
   * 释放分布式锁
   * @param key 锁的键名
   * @param value 锁的值（用于验证锁的所有权）
   * @returns 是否成功释放锁
   */
  async releaseLock(key: string, value: string = 'locked'): Promise<boolean> {
    try {
      // 使用Lua脚本确保原子性操作
      const luaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      const result = await this.client.eval(luaScript, {
        keys: [key],
        arguments: [value],
      });
      return result === 1;
    } catch (error) {
      this.logger.error(`释放锁失败 ${key}:`, error);
      return false;
    }
  }

  /**
   * 检查用户是否有正在进行的任务
   * @param userId 用户ID
   * @returns 是否有正在进行的任务
   */
  async hasActiveTask(userId: string): Promise<boolean> {
    try {
      const taskKey = `user_task:${userId}`;
      const result = await this.client.exists(taskKey);
      return result === 1;
    } catch (error) {
      this.logger.error(`检查用户任务失败 ${userId}:`, error);
      return false;
    }
  }

  /**
   * 设置用户任务状态
   * @param userId 用户ID
   * @param taskId 任务ID
   * @param ttl 任务超时时间（秒）
   * @returns 是否成功设置
   */
  async setUserTask(userId: string, taskId: string, ttl: number = 1800): Promise<boolean> {
    try {
      const taskKey = `user_task:${userId}`;
      const taskData = {
        taskId,
        startTime: new Date().toISOString(),
        status: 'processing',
      };

      const result = await this.client.set(taskKey, JSON.stringify(taskData), {
        NX: true, // 只在键不存在时设置
        EX: ttl,  // 设置过期时间
      });

      return result === 'OK';
    } catch (error) {
      this.logger.error(`设置用户任务失败 ${userId}:`, error);
      return false;
    }
  }

  /**
   * 完成用户任务
   * @param userId 用户ID
   * @returns 是否成功完成
   */
  async completeUserTask(userId: string): Promise<boolean> {
    try {
      const taskKey = `user_task:${userId}`;
      const result = await this.client.del(taskKey);
      return result === 1;
    } catch (error) {
      this.logger.error(`完成用户任务失败 ${userId}:`, error);
      return false;
    }
  }

  /**
   * 获取用户任务信息
   * @param userId 用户ID
   * @returns 任务信息
   */
  async getUserTask(userId: string): Promise<any> {
    try {
      const taskKey = `user_task:${userId}`;
      const taskData = await this.client.get(taskKey);
      return taskData ? JSON.parse(taskData) : null;
    } catch (error) {
      this.logger.error(`获取用户任务失败 ${userId}:`, error);
      return null;
    }
  }

  /**
   * 设置键值对
   * @param key 键名
   * @param value 值
   * @param ttl 过期时间（秒）
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      this.logger.error(`设置键值失败 ${key}:`, error);
      throw error;
    }
  }

  /**
   * 获取键值
   * @param key 键名
   * @returns 值
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`获取键值失败 ${key}:`, error);
      return null;
    }
  }

  /**
   * 删除键
   * @param key 键名
   * @returns 是否成功删除
   */
  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`删除键失败 ${key}:`, error);
      return false;
    }
  }

  /**
   * 检查键是否存在
   * @param key 键名
   * @returns 是否存在
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`检查键存在失败 ${key}:`, error);
      return false;
    }
  }

  /**
   * 关闭Redis连接
   */
  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis连接已关闭');
    }
  }
} 