import { applyDecorators, createParamDecorator, ExecutionContext, HttpStatus } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { BaseException } from '../exceptions/base.exception';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

function isIntNumberStringReg(str: string): boolean {
  return new RegExp(/^-?[0-9]+$/).test(str);
}

export const ApiPaginationQuery = () => {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      description: `Page number, default: ${DEFAULT_PAGE}`,
      type: Number,
    }),

    ApiQuery({
      name: 'limit',
      required: false,
      description: `Number items per page, default: ${DEFAULT_LIMIT}`,
      type: Number,
    }),
  );
};

const createPagination = (pageStr: string, limitStr: string): { page: number; limit: number } => {
  let page: number;
  let limit: number;

  if (pageStr === undefined || pageStr === null) {
    page = DEFAULT_PAGE;
  } else {
    if (!isIntNumberStringReg(pageStr)) {
      throw new BaseException('Page and limit must be an integer number.', HttpStatus.BAD_REQUEST);
    }
    page = +pageStr;
  }

  if (limitStr === undefined || limitStr === null) {
    limit = DEFAULT_LIMIT;
  } else {
    if (!isIntNumberStringReg(limitStr)) {
      throw new BaseException('Page and limit must be an integer number.', HttpStatus.BAD_REQUEST);
    }
    limit = +limitStr;
  }

  if (page < 0 || limit < 0) {
    throw new BaseException('Page and limit must be greater than 0.', HttpStatus.BAD_REQUEST);
  }

  if (page == 0 || limit == 0) {
    throw new BaseException('Page and limit must not be less than 1.', HttpStatus.BAD_REQUEST);
  }

  if (limit > 200) {
    throw new BaseException('Limit must not be greater than 200.', HttpStatus.BAD_REQUEST);
  }

  return {
    page,
    limit,
  };
};

export const Pagination = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return createPagination(req.query.page, req.query.limit);
});
