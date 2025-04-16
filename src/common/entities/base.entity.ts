import { BeforeInsert, PrimaryColumn } from "typeorm";
import { SnowflakeTransformer } from "../transformers/snowflake.transformer";
import { SnowflakeIdGenerator } from "../utils/snowflake.util";

export abstract class BaseEntity {
  @PrimaryColumn("bigint", {
    transformer: new SnowflakeTransformer(),
  })
  id: string;

  @BeforeInsert()
  generateId(): void {
    if (!this.id) {
      this.id = SnowflakeIdGenerator.getInstance().generateId().toString();
    }
  }
}
