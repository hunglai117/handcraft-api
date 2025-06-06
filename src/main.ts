import * as fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { IoAdapter } from "@nestjs/platform-socket.io";
import * as express from "express";
import { useContainer } from "class-validator";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AppModule } from "./app.module";
import { ValidationExceptionFilter } from "./common/filters/validation-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const configService = app.get(ConfigService);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.setGlobalPrefix(configService.get("app.prefixUrl"), {
    exclude: ["vnpay-ipn", "vnpay-return"],
  });

  app.useGlobalFilters(new ValidationExceptionFilter(logger));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
      },
      stopAtFirstError: true,
      disableErrorMessages: false,
      always: true,
    }),
  );

  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  if (["development", "staging"].includes(configService.get("app.env"))) {
    const config = new DocumentBuilder()
      .setTitle(configService.get("app.swagger.title"))
      .setDescription(configService.get("app.swagger.description"))
      .setVersion(configService.get("app.swagger.version"))
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(configService.get("app.swagger.path"), app, document);
    fs.writeFileSync("./swagger-spec.json", JSON.stringify(document));
  }

  // Configure WebSocket adapter with CORS settings matching the rest API
  app.useWebSocketAdapter(
    new (require("@nestjs/platform-socket.io").IoAdapter)(app),
  );

  // Configure WebSocket adapter with CORS settings matching the rest API
  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(configService.get("app.port"));
  logger.log(
    `Application is running on: ${configService.get("app.url")}`,
    "Bootstrap",
  );
  logger.log(
    `WebSocket server is available at: ${configService.get("app.url")}/orders`,
    "Bootstrap",
  );
  logger.log(
    `WebSocket server is available at: ${configService.get("app.url")}/orders`,
    "Bootstrap",
  );
}

bootstrap();
