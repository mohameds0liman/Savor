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

// Strict rate limiter for authentication endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Allow 15 attempts per 15 minutes
  message: { message: "Too many authentication attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", authLimiter, validate(LoginSchema), loginUser);
router.post("/refresh", validate(RefreshSchema), refreshAccessToken);
router.post("/logout", logoutUser);

export default router;