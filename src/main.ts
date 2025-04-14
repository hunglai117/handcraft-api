import * as dotenv from "dotenv";
dotenv.config();

import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { useContainer } from "class-validator";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AppModule } from "./app.module";

async function bootstrap() {
  // Create app
  const app = await NestFactory.create(AppModule);

  // Replace the default logger with winston
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const configService = app.get(ConfigService);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  // Use class-validator container
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Prefix
  app.setGlobalPrefix(configService.get("app.prefixUrl"));

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
      },
    })
  );

  app.enableCors();

  if (["development", "staging"].includes(configService.get("app.env"))) {
    const config = new DocumentBuilder()
      .setTitle(configService.get("app.swagger.title"))
      .setDescription(configService.get("app.swagger.description"))
      .setVersion(configService.get("app.swagger.version"))
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(configService.get("app.swagger.path"), app, document);
  }

  await app.listen(configService.get("app.port"));
  logger.log(
    `Application is running on: ${configService.get("app.url")}`,
    "Bootstrap"
  );
}
bootstrap();
