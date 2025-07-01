import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { TennisAnalysisController } from './tennis-analysis.controller';
import { TennisVenueController } from './tennis-venue.controller';
import { TennisAnalysisService } from './tennis-analysis.service';
import { WechatService } from './wechat.service';
import { TennisScoreService } from './tennis-score.service';
import { TennisVenueService } from './tennis-venue.service';
import { TennisVenueRatingService } from './tennis-venue-rating.service';
import { CosService } from './cos.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './models/user.model';
import { TennisScore } from './models/tennis-score.model';
import { TennisVenue } from './models/tennis-venue.model';
import { TennisVenueBookingMethod } from './models/tennis-venue-booking-method.model';
import { TennisVenueRating } from './models/tennis-venue-rating.model';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forFeature([User, TennisScore, TennisVenue, TennisVenueBookingMethod, TennisVenueRating]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'tennis-analysis-secret-key',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TennisAnalysisController, TennisVenueController],
  providers: [TennisAnalysisService, WechatService, TennisScoreService, TennisVenueService, TennisVenueRatingService, CosService, JwtAuthGuard],
  exports: [TennisAnalysisService, WechatService, TennisScoreService, TennisVenueService, TennisVenueRatingService, CosService],
})
export class TennisAnalysisModule { } 