import { Logger, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as dotenv from "dotenv";
import { OrderModule } from "src/modules/order/order.module";
import { OrderProcessor } from "src/modules/order/processors/order.processor";
import { SharedModule } from "src/modules/shared/shared.module";

dotenv.config();

async function bootstrap() {
  const logger = new Logger("OrderProcessorScript");

  try {
    const app = await NestFactory.createApplicationContext(
      OrderProcessorModule,
      {
        logger: ["error", "warn", "log"],
      },
    );

    const _orderProcessor = app.get(OrderProcessor);
    logger.log("Order processor is now running and listening for jobs");

    const shutdown = async () => {
      logger.log("Shutting down order processor");
      await app.close();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    logger.error(
      `Error running order processor script: ${error.message}`,
      error.stack,
    );
    process.exit(1);
  }
}

@Module({
  imports: [OrderModule, SharedModule],
  providers: [OrderProcessor],
})
class OrderProcessorModule {}

bootstrap();
