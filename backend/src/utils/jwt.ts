// backend/src/utils/jwt.ts
// ============================================
// LOW-LEVEL JWT UTILITIES
// ============================================
// Purpose: Pure functions for JWT operations.
// No Express dependencies - fully unit testable.
// Used by auth.service.ts and auth.middleware.ts

import jwt, { SignOptions, VerifyOptions, JwtPayload, Secret } from "jsonwebtoken";
import { env } from "../config/env";

/**
 * Sign a payload into a JWT string.
 * @param payload - Data to encode (user id, email, role)
 * @param secret - Signing secret (access or refresh)
 * @param options - Expiry, algorithm, etc.
 * @returns Signed JWT string
 */
export function signToken(
  payload: object,
  secret: Secret,
  options: SignOptions = {}
): string {
  // Default to HS256 algorithm, override if needed
  return jwt.sign(payload, secret, { algorithm: "HS256", ...options });
}

/**
 * Verify and decode a JWT.
 * @param token - JWT string to verify
 * @param secret - Secret used to sign (must match)
 * @param options - Verification options (ignoreExpiration, etc.)
 * @returns Decoded payload if valid, null if invalid/expired
 */
export function verifyToken<T extends JwtPayload = JwtPayload>(
  token: string,
  secret: Secret,
  options: VerifyOptions = {}
): T | null {
  try {
    return jwt.verify(token, secret, { algorithms: ["HS256"], ...options }) as T;
  } catch (err) {
    // Invalid signature, expired, malformed, etc.
    return null;
  }
}

/**
 * Decode a JWT WITHOUT verification.
 * Useful for reading expired tokens (e.g., in refresh flow).
 * @param token - JWT string
 * @returns Decoded payload or null if malformed
 */
export function decodeToken<T extends JwtPayload = JwtPayload>(token: string): T | null {
  try {
    return jwt.decode(token) as T;
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header.
 * @param authHeader - Value of Authorization header
 * @returns Token string or null if missing/malformed
 */
export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7); // Remove "Bearer " prefix
}

// Type for our token payload (extends JwtPayload for jwt lib compatibility)
export interface TokenPayload extends JwtPayload {
  id: string;      // MongoDB _id as string
  email: string;   // User email
  role: string;    // "user" | "admin"
}