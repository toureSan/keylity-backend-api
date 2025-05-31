import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configuration globale
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Keylity API')
    .setDescription('API pour la plateforme immobilière Keylity')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Récupération du port depuis la configuration
  const port = configService.get('port');
  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
}
bootstrap();
