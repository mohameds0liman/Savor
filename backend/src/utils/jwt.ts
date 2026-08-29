import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

const ACCESS_EXPIRES_IN = "1h";
const REFRESH_EXPIRES_IN = "30d";

export interface TokenPayload {
  id: string;
}

export async function generateAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

export async function generateRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}



export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, ACCESS_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded as TokenPayload);
    });
  });
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, REFRESH_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded as TokenPayload);
    });
  });
}

export async function getRefreshTokenExpirationDate(token: string): Promise<Date> {
  const decoded = jwt.decode(token) as { exp: number } | null;
  if (!decoded || !decoded.exp) {
    throw new Error("Invalid token");
  }
  return new Date(decoded.exp * 1000);
}