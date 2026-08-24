// backend/src/config/env.ts
// ============================================
// ENVIRONMENT VALIDATION
// ============================================
// Purpose: Fail fast at startup if required env vars are missing.
// This prevents cryptic runtime errors later.
// Loads once at app start, exports validated config object.

// Required environment variables for the auth system
const requiredEnvVars = [
  "JWT_SECRET",           // Secret for signing access tokens (min 32 chars)
  "JWT_REFRESH_SECRET",   // Secret for signing refresh tokens (different from above!)
  "MONGODB_URI",          // MongoDB connection string
  "PORT",                 // Server port
  "NODE_ENV",             // "development" | "production" | "test"
  "FRONTEND_URL",         // CORS origin (e.g., "http://localhost:3000")
] as const;

// Validate all required vars exist
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// JWT secrets - enforce minimum length for security
if (process.env.JWT_SECRET!.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters");
}
if (process.env.JWT_REFRESH_SECRET!.length < 32) {
  throw new Error("JWT_REFRESH_SECRET must be at least 32 characters");
}

// Export typed config object for use throughout app
export const env = {
  jwtSecret: process.env.JWT_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  mongodbUri: process.env.MONGODB_URI!,
  port: parseInt(process.env.PORT!, 10),
  nodeEnv: process.env.NODE_ENV! as "development" | "production" | "test",
  frontendUrl: process.env.FRONTEND_URL!,
  // Token expiry - short access, long refresh
  accessTokenExpiry: "15m",
  refreshTokenExpiry: "7d",
  // Cookie settings
  cookie: {
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "lax" as const,                      // CSRF protection
    httpOnly: true,                                // No JS access (XSS protection)
  },
} as const;

// Type helper for env object
export type EnvConfig = typeof env;