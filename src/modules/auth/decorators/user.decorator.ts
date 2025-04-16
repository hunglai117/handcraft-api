import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUser = createParamDecorator(
  (propertyPath: string | undefined, ctx: ExecutionContext) => {
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
