import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../middlewares/validate.middleware";
import { LoginSchema, RefreshSchema } from "../middlewares/validation/auth.validation";
import {
  loginUser,
  refreshAccessToken,
  logoutUser,
} from "../controllers/auth.controller";

const router = Router();
// stricter on auth endpoints (brute-force protection)
//windowMs: 15 * 60 * 1000 — the time window in milliseconds.  --> 15 minutes
//max: 10 — the maximum number of requests allowed within the time window.
const authLimiter = rateLimit({ windowMs: 0.5 * 60 * 1000, max: 10 });

router.post("/login", authLimiter, validate(LoginSchema), loginUser);
router.post("/refresh", authLimiter, validate(RefreshSchema), refreshAccessToken);
router.post("/logout", logoutUser);

export default router;