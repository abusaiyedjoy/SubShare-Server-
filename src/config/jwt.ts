export interface JWTConfig {
  secret: string;
  expiresIn: string;
}

export function getJWTConfig(env: { JWT_SECRET: string; JWT_EXPIRY: string }): JWTConfig {
  return {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRY || '24h',
  };
}