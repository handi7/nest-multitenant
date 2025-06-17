import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './dtos/env-config.dto';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { CustomValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const logger = new Logger('APP');
  const app = await NestFactory.create(AppModule);

  const env = app.get<ConfigService<EnvConfig>>(ConfigService);

  const port = env.get('APP_PORT') || 2000;

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new CustomValidationPipe());

  await app.listen(port, () => logger.log(`Running at port: ${port}`));
}
bootstrap();
