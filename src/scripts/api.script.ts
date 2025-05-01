#!/usr/bin/env node
import * as fs from "fs";
import * as dotenv from "dotenv";
import * as path from "path";

// Ensure we load dotenv relative to the project root
const rootDir = path.resolve(__dirname, "..");
const envPath = path.resolve(rootDir, ".env");
dotenv.config({ path: envPath });

import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as express from "express";
import { useContainer } from "class-validator";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { AppModule } from "../app.module";
import { ValidationExceptionFilter } from "../common/filters/validation-exception.filter";

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
    fs.writeFileSync(
      path.join(rootDir, "swagger-spec.json"),
      JSON.stringify(document),
    );
  }

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    try {
      await app.close();
      logger.log("Application gracefully closed", "Shutdown");
      process.exit(0);
    } catch (e) {
      logger.error(`Error during shutdown: ${e.message}`, e.stack, "Shutdown");
      process.exit(1);
    }
  });

  await app.listen(configService.get("app.port"));
  logger.log(
    `Application is running on: ${configService.get("app.url")}`,
    "Bootstrap",
  );
}

// Bootstrap the application
bootstrap().catch((err) => {
  console.error("Error starting application:", err);
  process.exit(1);
});
