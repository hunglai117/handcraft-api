import { registerAs } from '@nestjs/config';

export default registerAs('app', () => {
  return {
    name: process.env.APP_NAME || 'HandcraftBK',
    env: process.env.APP_ENV || 'development',
    prefixUrl: '/api',
    url: process.env.APP_URL || 'http://localhost:3119',
    port: process.env.APP_PORT || 3119,
    swagger: {
      title: 'HandcraftBK Service',
      description: 'Swagger documentation for HandcraftBK Service APIs',
      version: process.env.SWAGGER_VERSION || '1.0.0',
      user: process.env.SWAGGER_USER || 'admin',
      password: process.env.SWAGGER_PASSWORD || '1',
      path: '/docs',
    },
  };
});
