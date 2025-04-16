import { ValueTransformer } from "typeorm";

export class SnowflakeTransformer implements ValueTransformer {
  to(value: string | null): string | bigint | null {
    if (value === null || value === undefined) {
      return null;
    }
    return BigInt(value);
  }

  from(value: string | bigint | null): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    return value.toString();
  }
}
