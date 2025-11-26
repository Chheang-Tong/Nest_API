import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Serve static files (product images, etc.)
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // -------------------------
  // 🚀 SWAGGER CONFIGURATION
  // -------------------------
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pepper Shop API')
    .setDescription(
      'API documentation for products, cart, sell, promotion, reports',
    )
    .setVersion('1.0')
    .addBearerAuth() // 👈 Enable JWT token input
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, swaggerDoc); // http://localhost:3000/swagger

  const port = process.env.PORT || 3000;

  await app.listen(port);
  console.log(`🚀 App running at http://localhost:${port}`);
  console.log(`📘 Swagger Docs: http://localhost:${port}/swagger`);
}

void bootstrap();
