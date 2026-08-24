// // backend/src/controllers/auth.controller.ts
// // ============================================
// // AUTHENTICATION CONTROLLER
// // ============================================
// // Purpose: Handle HTTP requests for authentication endpoints.
// // - Delegates business logic to auth.service.ts
// // - Handles cookies, status codes, response formatting
// // - Does NOT contain business logic (that's in service)

// import { Request, Response } from "express";
// import User from "../models/User";
// import * as authService from "../services/auth.service";
// import { AuthRequest } from "../middlewares/auth";

// /**
//  * POST /api/auth/signup
//  * 
//  * Register a new user account.
//  * 1. Validates input (via validation middleware)
//  * 2. Checks if email already exists
//  * 3. Hashes password
//  * 4. Creates user in database
//  * 4. Generates token pair
//  * 5. Sets HttpOnly cookies
//  * 6. Returns sanitized user (no password)
//  * 
//  * @param req - Request with { name, email, password } in body
//  * @param res - Response
//  */
// export async function signup(req: Request, res: Response): Promise<void> {
//   try {
//     const { name, email, password } = req.body;

//     // Check for existing user
//     const existingUser = await User.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       res.status(409).json({ 
//         success: false, 
//         message: "Email already registered" 
//       });
//       return;
//     }

//     // Hash password before storing
//     const passwordHash = await authService.hashPassword(password);

//     // Create user (role defaults to "user" per schema)
//     const user = await User.create({
//       name,
//       email: email.toLowerCase(),
//       passwordHash,
//     });

//     // Generate tokens
//     const tokens = authService.generateTokenPair({
//       id: user._id.toString(),
//       email: user.email,
//       role: user.role,
//     });

//     // Set HttpOnly cookies
//     authService.setAuthCookies(res, tokens);

//     // Return sanitized user (no passwordHash)
//     res.status(201).json({
//       success: true,
//       message: "Account created successfully",
//       user: authService.sanitizeUser(user),
//     });
//   } catch (error) {
//     console.error("Signup error:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Internal server error" 
//     });
//   }
// }

// /**
//  * POST /api/auth/login
//  * 
//  * Authenticate user with email and password.
//  * 1. Finds user by email (includes passwordHash via .select("+passwordHash"))
//  * 2. Verifies password with bcrypt
//  * 3. Generates token pair
//  * 4. Sets HttpOnly cookies
//  * 5. Returns sanitized user
//  * 
//  * @param req - Request with { email, password } in body
//  * @param res - Response
//  */
// export async function login(req: Request, res: Response): Promise<void> {
//   try {
//     const { email, password } = req.body;

//     // Find user WITH passwordHash (schema has select: false)
//     const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");

//     if (!user) {
//       // Generic message to prevent email enumeration
//       res.status(401).json({ 
//         success: false, 
//         message: "Invalid email or password" 
//       });
//       return;
//     }

//     // Verify password
//     const isValid = await authService.verifyPassword(password, user.passwordHash);
//     if (!isValid) {
//       res.status(401).json({ 
//         success: false, 
//         message: "Invalid email or password" 
//       });
//       return;
//     }

//     // Generate tokens
//     const tokens = authService.generateTokenPair({
//       id: user._id.toString(),
//       email: user.email,
//       role: user.role,
//     });

//     // Set HttpOnly cookies
//     authService.setAuthCookies(res, tokens);

//     // Return sanitized user
//     res.json({
//       success: true,
//       message: "Login successful",
//       user: authService.sanitizeUser(user),
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Internal server error" 
//     });
//   }
// }

// /**
//  * POST /api/auth/refresh
//  * 
//  * Rotate access token using refresh token from HttpOnly cookie.
//  * 1. Reads refreshToken from cookie (NOT from body/header)
//  * 2. Verifies refresh token signature & expiry
//  * 3. Fetches user from DB (ensures user still exists/active)
//  * 4. Generates NEW token pair (rotation - old refresh invalidated)
//  * 5. Sets new cookies
//  * 6. Returns new access token (or just success)
//  * 
//  * SECURITY: Refresh token rotation prevents replay attacks.
//  * Each refresh generates a new refresh token, old one becomes invalid.
//  * 
//  * @param req - Request (refreshToken in cookie)
//  * @param res - Response
//  */
// export async function refresh(req: Request, res: Response): Promise<void> {
//   try {
//     // Read refresh token from HttpOnly cookie
//     const refreshToken = req.cookies?.refreshToken;

//     if (!refreshToken) {
//       res.status(401).json({ 
//         success: false, 
//         message: "Refresh token missing" 
//       });
//       return;
//     }

//     // Verify refresh token
//     const payload = authService.verifyRefreshToken(refreshToken);
//     if (!payload) {
//       // Invalid/expired - clear cookies and force re-login
//       authService.clearAuthCookies(res);
//       res.status(401).json({ 
//         success: false, 
//         message: "Session expired. Please log in again." 
//       });
//       return;
//     }

//     // Fetch user to ensure they still exist and are active
//     const user = await User.findById(payload.id);
//     if (!user) {
//       authService.clearAuthCookies(res);
//       res.status(401).json({ 
//         success: false, 
//         message: "User not found" 
//       });
//       return;
//     }

//     // Generate NEW token pair (rotation)
//     const tokens = authService.generateTokenPair({
//       id: user._id.toString(),
//       email: user.email,
//       role: user.role,
//     });

//     // Set new cookies (old refresh token now invalid)
//     authService.setAuthCookies(res, tokens);

//     res.json({
//       success: true,
//       message: "Token refreshed",
//       // Optionally return user data or just success
//       user: authService.sanitizeUser(user),
//     });
//   } catch (error) {
//     console.error("Token refresh error:", error);
//     authService.clearAuthCookies(res);
//     res.status(500).json({ 
//       success: false, 
//       message: "Internal server error" 
//     });
//   }
// }

// /**
//  * POST /api/auth/logout
//  * 
//  * Clear authentication cookies.
//  * With stateless JWT, we can't invalidate tokens server-side
//  * without a token blocklist (Redis) or DB-stored refresh tokens.
//  * Clearing cookies prevents further use from this browser.
//  * 
//  * @param req - Request (authenticated via authenticate middleware)
//  * @param res - Response
//  */
// export async function logout(_req: Request, res: Response): Promise<void> {
//   authService.clearAuthCookies(res);
//   res.json({ 
//     success: true, 
//     message: "Logged out successfully" 
//   });
// }

// /**
//  * GET /api/auth/me
//  * 
//  * Get current authenticated user's profile.
//  * Requires valid access token (authenticate middleware runs first).
//  * Returns user data from req.user (set by middleware) + fresh DB fetch.
//  * 
//  * @param req - Authenticated request (req.user attached by middleware)
//  * @param res - Response
//  */
// export async function me(req: AuthRequest, res: Response): Promise<void> {
//   try {
//     // req.user is set by authenticate middleware
//     if (!req.user) {
//       res.status(401).json({ 
//         success: false, 
//         message: "Not authenticated" 
//       });
//       return;
//     }

//     // Fetch fresh user data (in case role/name changed)
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       res.status(404).json({ 
//         success: false, 
//         message: "User not found" 
//       });
//       return;
//     }

//     res.json({
//       success: true,
//       user: authService.sanitizeUser(user),
//     });
//   } catch (error) {
//     console.error("Get current user error:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Internal server error" 
//     });
//   }
// }