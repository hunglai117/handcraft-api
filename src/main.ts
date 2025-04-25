import * as fs from "fs";
import * as dotenv from "dotenv";
// import * as path from "path";
dotenv.config();

import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as express from "express";
import { useContainer } from "class-validator";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AppModule } from "./app.module";
import { ValidationExceptionFilter } from "./common/filters/validation-exception.filter";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Serve static image files
  // const imagesPath = path.join(process.cwd(), "images");

  // app.use(
  //   "/images",
  //   express.static(imagesPath, {
  //     index: false,
  //     maxAge: "1d",
  //     setHeaders: (res) => {
  //       res.setHeader("Cache-Control", "public, max-age=86400, charset=utf-8");
  //       res.setHeader("Vary", "Accept-Encoding");
  //     },
  //   }),
  // );

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  const configService = app.get(ConfigService);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.setGlobalPrefix(configService.get("app.prefixUrl"));

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
    origin: true, // or specify your origins
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

  // Setup RabbitMQ microservice for receiving events
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${configService.get("RABBITMQ_USER", "guest")}:${configService.get(
          "RABBITMQ_PASSWORD",
          "guest",
        )}@${configService.get("RABBITMQ_HOST", "localhost")}:${configService.get(
          "RABBITMQ_PORT",
          "5672",
        )}`,
      ],
      queue: "order_events_queue",
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  await app.listen(configService.get("app.port"));
  logger.log(
    `Application is running on: ${configService.get("app.url")}`,
    "Bootstrap",
  );
}

bootstrap();
