import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "src/modules/users/entities/user.entity";

export const CurrentUser = createParamDecorator(
  (
    propertyPath: string | undefined,
    ctx: ExecutionContext,
  ): Partial<Omit<User, "password">> => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    if (!propertyPath) {
      return user;
    }

    const properties = propertyPath.split(".");
    return properties.reduce((obj, prop) => obj?.[prop], user);
  },
);
