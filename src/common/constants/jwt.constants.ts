export const JWT_CONSTANTS = {
  ACCESS_TOKEN_EXPIRES_IN: process.env['JWT_ACCESS_TOKEN_EXPIRES_IN'] ?? '15m',
  REFRESH_TOKEN_EXPIRES_IN: process.env['JWT_REFRESH_TOKEN_EXPIRES_IN'] ?? '7d',
  JWT_SECRET: process.env['JWT_SECRET'] ?? 'your_jwt_secret_key',
};
