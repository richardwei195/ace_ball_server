import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { TennisAnalysisController } from './tennis-analysis.controller';
import { TennisAnalysisService } from './tennis-analysis.service';
import { WechatService } from './wechat.service';
import { TennisScoreService } from './tennis-score.service';
import { CosService } from './cos.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './models/user.model';
import { TennisScore } from './models/tennis-score.model';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forFeature([User, TennisScore]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'tennis-analysis-secret-key',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TennisAnalysisController],
  providers: [TennisAnalysisService, WechatService, TennisScoreService, CosService, JwtAuthGuard],
  exports: [TennisAnalysisService, WechatService, TennisScoreService, CosService],
})
export class TennisAnalysisModule {} 