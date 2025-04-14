import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class EntityNotFoundException extends BaseException {
  constructor(entityName: string, id?: string) {
    super(id ? `No ${entityName} found for id ${id}.` : `No ${entityName} found.`, HttpStatus.BAD_REQUEST);
  }
}

export class ConfigNotFoundException extends Error {
  constructor(config: string) {
    super(`Error: config ${config} is not provided`);
  }
}
