import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => {
  return {
    jwt: {
      secret: process.env.JWT_SECRET || 'your-super-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '2h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
  };
});