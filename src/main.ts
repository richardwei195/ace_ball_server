import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  app.setGlobalPrefix('api');

  // 使用全局中间件记录请求日志
  app.use((req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms ${JSON.stringify(req.body, null, 2)}`
      );
    });

    next();
  });

  if (process.env.NODE_ENV === 'development') {
    // swigger
    const config = new DocumentBuilder()
      .setTitle('Love Tips API')
      .setDescription('Love Tips API description')
      .setVersion('1.0')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, documentFactory);

  }



  await app.listen(process.env.PORT ?? 3000);



  console.log(`Server is running on port ${process.env.PORT ?? 3000}`);
}

bootstrap();
