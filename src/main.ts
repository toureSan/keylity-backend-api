import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 👇 Charger les origins dynamiquement
  const allowedOrigins = configService
    .get<string>('CORS_ORIGIN')
    ?.split(',') ?? ['http://localhost:4000'];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Keylity API')
    .setDescription('API pour la plateforme immobilière Keylity')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get('port') || 3000;
  await app.listen(port);

  console.log('✅ App started on port:', port);
  console.log('✅ Allowed origins:', allowedOrigins);
  console.log('✅ NODE_ENV:', process.env.NODE_ENV);
}
bootstrap();
