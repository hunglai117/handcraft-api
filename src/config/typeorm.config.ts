import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { registerAs } from "@nestjs/config";

dotenv.config();

export default registerAs("typeorm", () => {
  return {
    type: process.env.DB_TYPE || "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: process.env.DB_SYNCHRONIZE === "true",
    logging: process.env.DB_LOGGING === "true",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  };
});

// Create the DataSource with explicit environment variables
export const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  synchronize: process.env.DB_SYNCHRONIZE === "true",
  logging: process.env.DB_LOGGING === "true",
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  migrations: [__dirname + "/../migrations/**/*{.ts,.js}"],
  migrationsTableName: "migrations",
});
