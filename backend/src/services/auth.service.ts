// import jwt, { SignOptions } from "jsonwebtoken";
// import { Response } from "express";

// const JWT_SECRET = process.env.JWT_SECRET!;
// const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
// const ACCESS_EXPIRY = "15m";
// const REFRESH_EXPIRY = "7d";

// if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
//   throw new Error("JWT secrets not configured");
// }

// export interface TokenPayload {
//   id: string;
//   email: string;
//   role: string;
// }

// export interface TokenPair {
//   accessToken: string;
//   refreshToken: string;
// }

// const accessOptions: SignOptions = { expiresIn: ACCESS_EXPIRY };
// const refreshOptions: SignOptions = { expiresIn: REFRESH_EXPIRY };

// export function generateAccessToken(payload: TokenPayload): string {
//   return jwt.sign(payload, JWT_SECRET, accessOptions);
// }

// export function generateRefreshToken(payload: TokenPayload): string {
//   return jwt.sign(payload, JWT_REFRESH_SECRET, refreshOptions);
// }

// export function generateTokenPair(payload: TokenPayload): TokenPair {
//   return {
//     accessToken: generateAccessToken(payload),
//     refreshToken: generateRefreshToken(payload),
//   };
// }

// export function verifyAccessToken(token: string): TokenPayload | null {
//   try {
//     return jwt.verify(token, JWT_SECRET) as TokenPayload;
//   } catch {
//     return null;
//   }
// }

// export function verifyRefreshToken(token: string): TokenPayload | null {
//   try {
//     return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
//   } catch {
//     return null;
//   }
// }

// export function setAuthCookies(res: Response, tokens: TokenPair): void {
//   const isProd = process.env.NODE_ENV === "production";

//   res.cookie("accessToken", tokens.accessToken, {
//     httpOnly: true,
//     secure: isProd,
//     sameSite: "lax",
//     maxAge: 15 * 60 * 1000, // 15 min
//   });

//   res.cookie("refreshToken", tokens.refreshToken, {
//     httpOnly: true,
//     secure: isProd,
//     sameSite: "lax",
//     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     path: "/api/auth/refresh", // only sent to refresh endpoint
//   });
// }

// export function clearAuthCookies(res: Response): void {
//   res.clearCookie("accessToken");
//   res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
// }

// export function extractTokenFromHeader(authHeader?: string): string | null {
//   if (!authHeader?.startsWith("Bearer ")) return null;
//   return authHeader.split(" ")[1];
// }




// backend/src/services/auth.service.ts
// ============================================
// AUTHENTICATION SERVICE
// ============================================
// Purpose: Business logic for authentication operations.
// - Token generation (access + refresh pairs)
// - Token verification
// - Password hashing/verification
// - Cookie management (HttpOnly, secure)
// 
// This is the ONLY place that should:
// - Call jwt.sign/jwt.verify (via utils/jwt.ts)
// - Know about token expiry times
// - Handle cookie options
// Controllers call these methods, never touch JWT directly.

import { Response } from "express";
import bcrypt from "bcrypt";
import { signToken, verifyToken, TokenPayload } from "../utils/jwt";
import { env } from "../config/env";

/**
 * Payload structure for our JWT tokens
 * Contains minimal user info needed for authorization
 */
export interface AuthTokenPayload {
  id: string;      // User._id as string
  email: string;   // User email
  role: string;    // "user" | "admin"
}

/**
 * Token pair returned on login/signup/refresh
 */
export interface TokenPair {
  accessToken: string;   // Short-lived (15min) - for API authorization
  refreshToken: string;  // Long-lived (7d) - for getting new access tokens
}

/**
 * Hash a plaintext password using bcrypt.
 * @param password - Plaintext password
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  // Cost factor 12 = ~250ms on modern CPU, good balance of security/performance
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a plaintext password against a bcrypt hash.
 * @param password - Plaintext password from login attempt
 * @param hash - Stored bcrypt hash from database
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate an access token (short-lived, 15 minutes).
 * Used for authorizing API requests.
 * 
 * @param payload - User data to encode
 * @returns Signed JWT access token
 */
export function generateAccessToken(payload: AuthTokenPayload): string {
  return signToken(payload, env.jwtSecret, { 
    expiresIn: env.accessTokenExpiry  // "15m"
  });
}

/**
 * Generate a refresh token (long-lived, 7 days).
 * Used ONLY to obtain new access tokens.
 * Stored in HttpOnly cookie, never in localStorage.
 * 
 * @param payload - User data to encode
 * @returns Signed JWT refresh token
 */
export function generateRefreshToken(payload: AuthTokenPayload): string {
  return signToken(payload, env.jwtRefreshSecret, { 
    expiresIn: env.refreshTokenExpiry  // "7d"
  });
}

/**
 * Generate both access and refresh tokens for a user.
 * Called on login, signup, and token refresh.
 * 
 * @param user - User object with id, email, role
 * @returns Object containing both tokens
 */
export function generateTokenPair(user: { id: string; email: string; role: string }): TokenPair {
  const payload: AuthTokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Verify an access token (from Authorization header).
 * Returns decoded payload if valid, null otherwise.
 * 
 * @param token - Access token string
 * @returns Decoded payload or null
 */
export function verifyAccessToken(token: string): AuthTokenPayload | null {
  return verifyToken<AuthTokenPayload>(token, env.jwtSecret);
}

/**
 * Verify a refresh token (from HttpOnly cookie).
 * Returns decoded payload if valid, null otherwise.
 * 
 * @param token - Refresh token string
 * @returns Decoded payload or null
 */
export function verifyRefreshToken(token: string): AuthTokenPayload | null {
  return verifyToken<AuthTokenPayload>(token, env.jwtRefreshSecret);
}

/**
 * Set authentication cookies on the response.
 * 
 * SECURITY FEATURES:
 * - HttpOnly: Prevents XSS (JavaScript cannot read cookies)
 * - Secure: Only sent over HTTPS (in production)
 * - SameSite=lax: CSRF protection (allows top-level navigation)
 * - Path restriction: Refresh cookie only sent to /api/auth/refresh
 * 
 * @param res - Express response object
 * @param tokens - Token pair to set as cookies
 */
export function setAuthCookies(res: Response, tokens: TokenPair): void {
  const isProduction = env.nodeEnv === "production";

  // Access token cookie - sent with every API request
  res.cookie("accessToken", tokens.accessToken, {
    httpOnly: env.cookie.httpOnly,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    maxAge: 15 * 60 * 1000, // 15 minutes in ms
    path: "/",              // Sent to all API routes
  });

  // Refresh token cookie - ONLY sent to refresh endpoint
  // This limits exposure if there's any cookie leakage
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: env.cookie.httpOnly,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: "/api/auth/refresh",       // ONLY sent to refresh endpoint
  });
}

/**
 * Clear authentication cookies (logout).
 * Must match the same options used when setting cookies.
 * 
 * @param res - Express response object
 */
export function clearAuthCookies(res: Response): void {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
}

/**
 * Create a safe user object for API responses.
 * Excludes passwordHash and other sensitive fields.
 * 
 * @param user - Mongoose user document
 * @returns Sanitized user object
 */
export function sanitizeUser(user: {
  _id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  favorites?: string[];
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    image: user.image,
    favorites: user.favorites || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}