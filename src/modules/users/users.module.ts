import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UserProvider } from "./entities/user-provider.entity";
import { UsersService } from "./users.service";
import { AdminUsersController, UsersController } from "./users.controller";
import { UserProviderService } from "./user-provider.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProvider])],
  providers: [UsersService, UserProviderService],
  controllers: [UsersController, AdminUsersController],
  exports: [
    UsersService,
    UserProviderService,
    TypeOrmModule.forFeature([User, UserProvider]),
  ],
})
export class UsersModule {}
