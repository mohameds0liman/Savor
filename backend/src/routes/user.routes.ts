import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../middlewares/validate.middleware";
import { auth } from "../middlewares/auth.middleware";

import {
  CreateUserSchema,
  UpdateUserSchema,
  ChangePasswordSchema,
} from "../middlewares/validation/user.validation";
import {
  createUser,
  updateUser,
  changePassword,
  getUsers,
  getUserById,
  deleteUser,
  getFavourites,
  addFavourite,
  removeFavourite,
} from "../controllers/user.controller";

const router = Router();

// Rate limiter for user creation / password change (brute-force prevention)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { message: "Too many attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/signup", authLimiter, validate(CreateUserSchema), createUser);
router.patch("/user", auth, validate(UpdateUserSchema), updateUser);
router.get("/user/me", auth, getUserById);
router.get("/user", auth, getUsers);
router.delete("/user", auth, deleteUser);
router.put("/user/password", authLimiter, auth, validate(ChangePasswordSchema), changePassword);

// Favourites routes — no rate limiter to allow normal UI interactions
router.get("/user/favourites", auth, getFavourites);
router.post("/user/favourites/:id", auth, addFavourite);
router.delete("/user/favourites/:id", auth, removeFavourite);

export default router;