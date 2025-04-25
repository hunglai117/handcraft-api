import { registerAs } from "@nestjs/config";

export default registerAs("redis", () => {
  return {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || "1",
    keyPrefix: "hbk:",
  };
});
