import type { User } from "./user";

// Shape of the `data` payload returned by POST /api/login and POST /api/signup
// (memory.md §2.6) — both endpoints return the same shape, so signup can
// auto-login a user immediately.
export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

// Mirrors LoginSchema (backend/src/middlewares/validation/auth.validation.ts).
export type LoginInput = {
  email: string;
  password: string;
};

// Mirrors CreateUserSchema (backend/src/middlewares/validation/user.validation.ts).
export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};
