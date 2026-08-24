// import { Request, Response, NextFunction } from "express";
// import jwt, { JwtPayload } from "jsonwebtoken";

// export interface AuthRequest extends Request {
//   user?: JwtPayload & { id: string; email: string; role: string };
// }

// type TokenPayload = {
//   id: string;
//   email: string;
//   role: string;
// }

// const JWT_SECRET = process.env.JWT_SECRET!;
// if (!JWT_SECRET) throw new Error("JWT_SECRET not set in env");

// export const authenticate = (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ): void => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader?.startsWith("Bearer ")) {
//     res.status(401).json({ message: "Access denied. No token provided." });
//     return;
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
//     req.user = decoded;
//     next();
//   } catch (err) {
//     if (err instanceof jwt.TokenExpiredError) {
//       res.status(401).json({ message: "Token expired." });
//     } else if (err instanceof jwt.JsonWebTokenError) {
//       res.status(401).json({ message: "Invalid token." });
//     } else {
//       res.status(500).json({ message: "Authentication error." });
//     }
//   }
// };

// export const authorize = (...allowedRoles: string[]) => {
//   return (req: AuthRequest, res: Response, next: NextFunction): void => {
//     if (!req.user) {
//       res.status(401).json({ message: "Not authenticated." });
//       return;
//     }
//     if (!allowedRoles.includes(req.user.role)) {
//       res.status(403).json({ message: "Insufficient permissions." });
//       return;
//     }
//     next();
//   };
// };

// export const optionalAuth = (
//   req: AuthRequest,
//   _res: Response,
//   next: NextFunction
// ): void => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader?.startsWith("Bearer ")) return next();

//   const token = authHeader.split(" ")[1];
//   try {
//     req.user = jwt.verify(token, JWT_SECRET) as TokenPayload;
//   } catch {
//     // ignore invalid token, treat as unauthenticated
//   }
//   next();
// };





// backend/src/middlewares/auth.ts
// ============================================
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ============================================
// Purpose: Express middleware functions for protecting routes.
// - authenticate: Requires valid access token, attaches user to req
// - authorize: Requires specific role(s)
// - optionalAuth: Attaches user if token present & valid, never blocks

import { Request, Response, NextFunction } from "express";
import { verifyToken, extractBearerToken, TokenPayload } from "../utils/jwt";
import { env } from "../config/env";

// Extend Express Request type to include authenticated user
// This allows TypeScript to know req.user exists after authenticate()
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * MIDDLEWARE: authenticate
 * 
 * Verifies the access token from Authorization header.
 * On success: attaches decoded payload to req.user, calls next().
 * On failure: sends 401 response, does NOT call next().
 * 
 * Usage: router.get("/protected", authenticate, controller.handler)
 * 
 * @param req - Express request (expects Authorization: Bearer <token>)
 * @param res - Express response
 * @param next - Next middleware in chain
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 1. Extract token from Authorization header
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    // No token provided - client must authenticate
    res.status(401).json({ 
      success: false, 
      message: "Authentication required. No token provided." 
    });
    return;
  }

  // 2. Verify token signature and expiry
  const payload = verifyToken<TokenPayload>(token, env.jwtSecret);

  if (!payload) {
    // Token invalid, expired, or malformed
    res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token." 
    });
    return;
  }

  // 3. Attach user to request for downstream handlers
  req.user = payload;

  // 4. Continue to next middleware/controller
  next();
}

/**
 * MIDDLEWARE: authorize(...roles)
 * 
 * Checks if authenticated user has one of the allowed roles.
 * MUST be used AFTER authenticate() middleware.
 * 
 * Usage: router.delete("/users/:id", authenticate, authorize("admin"), controller.deleteUser)
 * 
 * @param allowedRoles - Roles permitted to access this route
 * @returns Middleware function
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // authenticate() should have run first and attached req.user
    if (!req.user) {
      // This indicates a middleware ordering bug
      res.status(401).json({ 
        success: false, 
        message: "Authentication required." 
      });
      return;
    }

    // Check if user's role is in allowed list
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: "Insufficient permissions. Required role: " + allowedRoles.join(" or ") 
      });
      return;
    }

    // User has required role
    next();
  };
}

/**
 * MIDDLEWARE: optionalAuth
 * 
 * Attempts to authenticate but NEVER blocks the request.
 * If token is valid, attaches req.user. If invalid/missing, continues anyway.
 * Useful for routes that behave differently for authenticated vs anonymous users.
 * 
 * Usage: router.get("/recipes", optionalAuth, controller.getRecipes)
 *        (can show "favorited" status if logged in)
 * 
 * @param req - Express request
 * @param res - Express response  
 * @param next - Next middleware
 */
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    // No token - continue as anonymous
    return next();
  }

  const payload = verifyToken<TokenPayload>(token, env.jwtSecret);
  
  if (payload) {
    // Valid token - attach user
    req.user = payload;
  }
  // Invalid token - treat as anonymous (don't error)

  next();
}