import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(helmet());
  app.enableCors();
  await app.listen(configService.get<number>('PORT') || 5000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
