import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import { TennisAnalysisModule } from "./tennis-analysis/tennis-analysis.module";
import { RedisModule } from "./redis/redis.module";
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    RedisModule,
    TennisAnalysisModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
