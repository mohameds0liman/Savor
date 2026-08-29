import {Request, Response,NextFunction} from "express";
import {verifyAccessToken} from "../utils/jwt";

// auth middleware to verify access token and Protect routes
export async function auth(req:Request,res:Response,next:NextFunction){
    const authHeader=req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No access token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = await verifyAccessToken(token);
        (req as any).user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
