import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as STS from 'qcloud-cos-sts';
import { v4 as uuidv4 } from 'uuid';
import {
  GetUploadTokenDto,
  CosUploadTokenResponseDto,
} from './dto/cos-upload.dto';

@Injectable()
export class CosService {
  private readonly logger = new Logger(CosService.name);
  private readonly secretId: string;
  private readonly secretKey: string;
  private readonly bucket: string;
  private readonly region: string;
  private readonly cdnDomain: string;
  private readonly allowPrefix: string;

  constructor(private configService: ConfigService) {
    this.secretId = this.configService.get<string>('TENCENT_SECRET_ID') || '';
    this.secretKey = this.configService.get<string>('TENCENT_SECRET_KEY') || '';
    this.bucket = this.configService.get<string>('COS_BUCKET') || '';
    this.region = this.configService.get<string>('COS_REGION') || 'ap-nanjing';
    this.cdnDomain = this.configService.get<string>('COS_CDN_DOMAIN') || '';
    this.allowPrefix = this.configService.get<string>('COS_ALLOW_PREFIX') || 'tennis-uploads/*';

    if (!this.secretId || !this.secretKey || !this.bucket) {
      throw new Error('腾讯云COS配置缺失：TENCENT_SECRET_ID, TENCENT_SECRET_KEY, COS_BUCKET 是必需的');
    }
  }

  /**
   * 获取上传临时密钥
   */
  async getUploadToken(userId: string, uploadDto: GetUploadTokenDto): Promise<CosUploadTokenResponseDto> {
    try {
      this.logger.log(`获取上传临时密钥，用户ID: ${userId}, 文件类型: ${uploadDto.fileType}`);

      // 生成上传路径前缀
      const prefix = this.generateUploadPrefix(userId, uploadDto.fileType);

      // 配置临时密钥策略
      const policy = this.generateUploadPolicy(prefix, uploadDto);

      console.log('policy', policy);

      // 获取临时密钥
      const stsResult = await this.getStsToken(policy);

      const response: CosUploadTokenResponseDto = {
        tmpSecretId: stsResult.credentials.tmpSecretId,
        tmpSecretKey: stsResult.credentials.tmpSecretKey,
        sessionToken: stsResult.credentials.sessionToken,
        startTime: stsResult.startTime,
        expiredTime: stsResult.expiredTime,
        bucket: this.bucket,
        region: this.region,
        prefix: prefix,
        cdnDomain: this.cdnDomain,
      };

      this.logger.log(`临时密钥获取成功，用户ID: ${userId}, 有效期至: ${new Date(stsResult.expiredTime * 1000)}`);
      return response;

    } catch (error) {
      this.logger.error(`获取上传临时密钥失败: ${error.message}`, error.stack);
      throw new BadRequestException(`获取上传密钥失败: ${error.message}`);
    }
  }

  /**
   * 上传完成回调
   */
  async uploadComplete(userId: string, completeDto: any): Promise<any> {
    try {
      this.logger.log(`文件上传完成，用户ID: ${userId}, 文件Key: ${completeDto.fileKey}`);

      // 验证文件Key是否符合用户权限
      const expectedPrefix = this.generateUploadPrefix(userId, completeDto.fileType);
      if (!completeDto.fileKey.startsWith(expectedPrefix)) {
        throw new BadRequestException('文件路径不符合权限要求');
      }

      // 生成文件访问URL
      const fileUrl = this.generateFileUrl(completeDto.fileKey);

      const response: any = {
        fileUrl,
        fileKey: completeDto.fileKey,
        fileType: completeDto.fileType,
        uploadTime: new Date(),
      };

      this.logger.log(`文件上传完成处理成功，文件URL: ${fileUrl}`);
      return response;

    } catch (error) {
      this.logger.error(`处理上传完成失败: ${error.message}`, error.stack);
      throw new BadRequestException(`处理上传完成失败: ${error.message}`);
    }
  }

  /**
   * 生成上传路径前缀
   */
  private generateUploadPrefix(userId: string, fileType: string): string {
    const now = new Date();

    return `tennis-uploads/*`;
  }

  /**
   * 生成上传策略
   */
  private generateUploadPolicy(prefix: string, uploadDto: GetUploadTokenDto): any {
    var shortBucketName = this.bucket.substr(0, this.bucket.lastIndexOf('-'));
    var appId = this.bucket.substr(1 + this.bucket.lastIndexOf('-'));

    const allowActions = [
      'name/cos:PutObject',
      'name/cos:PostObject',
      'name/cos:InitiateMultipartUpload',
      'name/cos:ListMultipartUploads',
      'name/cos:ListParts',
      'name/cos:UploadPart',
      'name/cos:CompleteMultipartUpload',
    ];

    const policy = {
      version: '2.0',
      statement: [
        {
          effect: 'allow',
          principal: { qcs: ['*'] },
          action: allowActions,
          resource: [
            'qcs::cos:' + this.region + ':uid/' + appId + ':prefix//' + appId + '/' + shortBucketName + '/' + this.allowPrefix,
          ],
          condition: {},
        },
      ],
    };

    // 添加文件大小限制
    if (uploadDto.fileSize) {
      policy.statement[0].condition = {
        'numeric_less_than_equal': {
          'cos:content-length': uploadDto.fileSize * 2, // 允许比声明大小大一倍
        },
      };
    }

    return policy;
  }

  /**
   * 获取STS临时密钥
   */
  private async getStsToken(policy: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const config = {
        secretId: this.secretId,
        secretKey: this.secretKey,
        policy: policy,
        durationSeconds: 3600, // 1小时有效期
        bucket: this.bucket,
        region: this.region,
        allowPrefix: this.allowPrefix,
        endpoint: 'sts.tencentcloudapi.com', // 域名，非必须，与host二选一，默认为 sts.tencentcloudapi.com
      };

      console.log('config', config);

      STS.getCredential(config, (err: any, data: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  /**
   * 生成文件访问URL
   */
  private generateFileUrl(fileKey: string): string {
    if (this.cdnDomain) {
      return `${this.cdnDomain}/${fileKey}`;
    } else {
      return `https://${this.bucket}.cos.${this.region}.myqcloud.com/${fileKey}`;
    }
  }

  /**
   * 生成唯一文件名
   */
  generateUniqueFileName(originalName: string, fileExtension?: string): string {
    const uuid = uuidv4();
    const ext = fileExtension || this.getFileExtension(originalName);
    const timestamp = Date.now();

    return `${timestamp}-${uuid}.${ext}`;
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
  }

  /**
   * 验证文件类型
   */
  validateFileType(fileType: string, fileExtension: string): boolean {
    const allowedTypes = {
      video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v'],
      image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
      document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
    };

    const allowed = allowedTypes[fileType as keyof typeof allowedTypes];
    return allowed ? allowed.includes(fileExtension.toLowerCase()) : false;
  }

  /**
   * 获取文件大小限制（字节）
   */
  getFileSizeLimit(fileType: string): number {
    const limits = {
      video: 500 * 1024 * 1024, // 500MB
      image: 10 * 1024 * 1024,  // 10MB
      document: 50 * 1024 * 1024, // 50MB
    };

    return limits[fileType as keyof typeof limits] || 10 * 1024 * 1024;
  }
} 