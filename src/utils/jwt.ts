import { sign, verify } from 'hono/jwt';

export interface JWTPayload {
  userId: number;
  email: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

export async function generateToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  secret: string,
  expiresIn: string = '24h'
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + parseExpiry(expiresIn);

  const tokenPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp,
  };

  return await sign(tokenPayload, secret);
}

export async function verifyToken(
  token: string,
  secret: string
): Promise<JWTPayload | null> {
  try {
    const payload = await verify(token, secret);
    return payload as JwtPayload;
  } catch (error) {
    return null;
  }
}

function parseExpiry(expiresIn: string): number {
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1));

  switch (unit) {
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    case 'm':
      return value * 60;
    case 's':
      return value;
    default:
      return 24 * 60 * 60; // default 24 hours
  }
}