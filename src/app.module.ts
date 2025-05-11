import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ForwardController } from "./app.controller";
import { AdminModule } from "./modules/admin/admin.module";
import { AuthModule } from "./modules/auth/auth.module";
import { RolesGuard } from "./modules/auth/guards/roles.guard";
import { JwtAuthGuard } from "./modules/auth/jwt-auth.guard";
import { CartModule } from "./modules/cart/cart.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { CommentsModule } from "./modules/comments/comments.module";
import { OrderModule } from "./modules/order/order.module";
import { ProductsModule } from "./modules/products/products.module";
import { PromotionsModule } from "./modules/promotions/promotions.module";
import { SharedModule } from "./modules/shared/shared.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    SharedModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    PromotionsModule,
    CartModule,
    OrderModule,
    AuthModule,
    CommentsModule,
    AdminModule,
  ],
  controllers: [ForwardController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
