import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminDashboardController } from "./controllers/admin-dashboard.controller";
import { AdminUsersController } from "./controllers/admin-users.controller";
import { AdminProductsController } from "./controllers/admin-products.controller";
import { AdminCategoriesController } from "./controllers/admin-categories.controller";
import { AdminPromotionsController } from "./controllers/admin-promotions.controller";
import { AdminOrdersController } from "./controllers/admin-orders.controller";
import { AdminCommentsController } from "./controllers/admin-comments.controller";

import { UsersModule } from "../users/users.module";
import { ProductsModule } from "../products/products.module";
import { CategoriesModule } from "../categories/categories.module";
import { OrderModule } from "../order/order.module";
import { PromotionsModule } from "../promotions/promotions.module";
import { CommentsModule } from "../comments/comments.module";

import { AdminService } from "./services/admin.service";
import { AdminOrderService } from "./services/admin-order.service";
import { AdminDashboardService } from "./services/admin-dashboard.service";
import { AdminUserService } from "./services/admin-user.service";
import { AdminProductService } from "./services/admin-product.service";
import { AdminCategoryService } from "./services/admin-category.service";
import { AdminPromotionService } from "./services/admin-promotion.service";
import { AdminCommentService } from "./services/admin-comment.service";

import { User } from "../users/entities/user.entity";
import { Product } from "../products/entities/product.entity";
import { Order } from "../order/entities/order.entity";
import { Comment } from "../comments/entities/comment.entity";
import { CommentReply } from "../comments/entities/comment-reply.entity";
import { Category } from "../categories/entities/category.entity";
import { Promotion } from "../promotions/entities/promotion.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Product,
      Order,
      Comment,
      CommentReply,
      Category,
      Promotion,
    ]),
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrderModule,
    PromotionsModule,
    CommentsModule,
  ],
  controllers: [
    AdminDashboardController,
    AdminUsersController,
    AdminProductsController,
    AdminCategoriesController,
    AdminOrdersController,
    AdminPromotionsController,
    AdminCommentsController,
  ],
  providers: [
    AdminService,
    AdminOrderService,
    AdminDashboardService,
    AdminUserService,
    AdminProductService,
    AdminCategoryService,
    AdminPromotionService,
    AdminCommentService,
  ],
})
export class AdminModule {}
