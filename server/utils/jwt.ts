import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
  teacherId?: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  return jwt.verify(token, secret) as TokenPayload;
};
