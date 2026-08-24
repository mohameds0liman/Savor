// // backend/src/routes/auth.routes.ts
// // ============================================
// // AUTHENTICATION ROUTES
// // ============================================
// // Purpose: Define authentication endpoints and apply middleware.
// // Public routes: signup, login, refresh
// // Protected routes: me, logout (require authenticate middleware)

// import { Router } from "express";
// import { authenticate } from "../middlewares/auth";
// import {
//   signup,
//   login,
//   refresh,
//   logout,
//   me,
// } from "../controllers/auth.controller";

// const router = Router();

// // ============================================
// // PUBLIC ROUTES (no authentication required)
// // ============================================

// /**
//  * @route POST /api/auth/signup
//  * @description Register new user account
//  * @access Public
//  * @body { name, email, password }
//  * @returns { user, accessToken cookie, refreshToken cookie }
//  */
// router.post("/signup", signup);

// /**
//  * @route POST /api/auth/login
//  * @description Authenticate user with email/password
//  * @access Public
//  * @body { email, password }
//  * @returns { user, accessToken cookie, refreshToken cookie }
//  */
// router.post("/login", login);

// /**
//  * @route POST /api/auth/refresh
//  * @description Get new access token using refresh token
//  * @access Public (but requires valid refresh token cookie)
//  * @cookie refreshToken
//  * @returns { user, new accessToken cookie, new refreshToken cookie }
//  */
// router.post("/refresh", refresh);

// // ============================================
// // PROTECTED ROUTES (require valid access token)
// // ============================================

// /**
//  * @route GET /api/auth/me
//  * @description Get current authenticated user profile
//  * @access Private (requires Authorization: Bearer <accessToken>)
//  * @header Authorization: Bearer <token>
//  * @returns { user }
//  */
// router.get("/me", authenticate, me);

// /**
//  * @route POST /api/auth/logout
//  * @description Clear authentication cookies
//  * @access Private
//  * @header Authorization: Bearer <token>
//  * @returns { message }
//  */
// router.post("/logout", authenticate, logout);

// export default router;