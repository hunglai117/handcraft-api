import { registerAs } from "@nestjs/config";

export default registerAs("rabbitmq", () => {
  const host = process.env.RABBITMQ_HOST || "localhost";
  const port = parseInt(process.env.RABBITMQ_PORT || "5672", 10);
  const user = process.env.RABBITMQ_USER || "user";
  const password = process.env.RABBITMQ_PASSWORD || "1";

  return {
    host,
    port,
    user,
    password,
    url: `amqp://${user}:${password}@${host}:${port}`,
  };
});
