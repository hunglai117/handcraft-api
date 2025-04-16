import { Snowflake } from "@sapphire/snowflake";

export class SnowflakeIdGenerator {
  private static instance: SnowflakeIdGenerator;
  private snowflake: Snowflake;

  private constructor() {
    this.snowflake = new Snowflake(new Date("2025-04-16T00:00:00.000Z"));
  }

  public static getInstance(): SnowflakeIdGenerator {
    if (!SnowflakeIdGenerator.instance) {
      SnowflakeIdGenerator.instance = new SnowflakeIdGenerator();
    }
    return SnowflakeIdGenerator.instance;
  }

  public generateId(): bigint {
    return this.snowflake.generate();
  }
}
