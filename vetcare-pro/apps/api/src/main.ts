import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Segurança
  app.use(helmet());
  app.enableCors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  app.setGlobalPrefix('api');
  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`✅ VETCARE-PRO API rodando em http://localhost:${port}/api`);
}
bootstrap();
