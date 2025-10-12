import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import { ValidationInterceptor } from './common/interceptors/validation.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Charger les origins dynamiquement
  const allowedOrigins = configService
    .get<string>('cors.origin')
    ?.split(',') ?? ['http://localhost:4000', 'https://keylity.ch'];

  // Augmenter les limites de taille des requêtes
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
    disableErrorMessages: false,
    skipMissingProperties: false,
    skipNullProperties: false,
    skipUndefinedProperties: false,
    validationError: {
      target: false,
      value: false,
    },
  }));
  
  app.useGlobalInterceptors(new ValidationInterceptor());
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

}
bootstrap();
