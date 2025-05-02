import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Order } from "../entities/order.entity";
import { OrderItem } from "../entities/order-item.entity";
import { ProductVariant } from "src/modules/products/entities/product-variant.entity";
import { PaymentTransaction } from "src/modules/payment/entities/payment-transaction.entity";
import { CartService } from "src/modules/cart/services/cart.service";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { RedisService } from "src/modules/redis/redis.service";
import { RedisLockService } from "src/modules/redis/redis-lock.service";
import { VnpayWrapperService } from "src/modules/payment/services/vnpay-wrapper.service";
import { OrderStatus } from "../entities/order-status.enum";
import { PaymentStatus } from "src/modules/payment/enums/payment-status.enum";

@Injectable()
export class OrderProcessService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    // @InjectRepository(OrderPromotion)
    // private orderPromotionRepository: Repository<OrderPromotion>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(PaymentTransaction)
    private paymentTransactionRepository: Repository<PaymentTransaction>,
    private cartService: CartService,
    private dataSource: DataSource,
    @InjectQueue("orders") private ordersQueue: Queue,
    private redisService: RedisService,
    private lockService: RedisLockService,
    private vnpayWrapperService: VnpayWrapperService,
  ) {}

  async handleUpdateCompletePayment(body: {
    orderId: string;
    paymentDetails: Record<string, any>;
  }) {
    const { orderId, paymentDetails } = body;

    await this.dataSource.transaction(async (manager) => {
      await manager.update(
        Order,
        {
          id: orderId,
        },
        {
          orderStatus: OrderStatus.PAID,
          paymentStatus: PaymentStatus.COMPLETED,
        },
      );

      await manager.update(
        PaymentTransaction,
        { id: paymentDetails.id },
        {
          paymentStatus: PaymentStatus.COMPLETED,
          metadata: paymentDetails,
        },
      );
    });
  }

  async handleUpdateCancelPayment() {}
}
