import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload } from '../types/env';

const textEncoder = new TextEncoder();

export const createUserTokens = async (user: { _id: string; email: string; role: string }, secrets: { access: string; refresh: string }) => {
  const payload = {
    _id: user._id,
    email: user.email,
    role: user.role
  };

  const accessToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(textEncoder.encode(secrets.access));

  const refreshToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(textEncoder.encode(secrets.refresh));

  return { accessToken, refreshToken };
};

export const verifyToken = async (token: string, secret: string): Promise<JWTPayload> => {
  const { payload } = await jwtVerify(token, textEncoder.encode(secret));
  return payload as JWTPayload;
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as JWTPayload;
  } catch {
    return null;
  }
};
