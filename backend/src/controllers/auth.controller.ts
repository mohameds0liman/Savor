import {Request, Response} from "express";
import * as authService from "../services/auth.service";




export async function loginUser(req: Request, res: Response) {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: "Email and Password are required"
        });
    }
    try {
        const { accessToken, refreshToken, user } = await authService.loginUser(email, password, { ip: String(req.ip), userAgent: req.headers['user-agent'] || '' });
        return res.status(200).json({message:"Login Successful",data:{accessToken, refreshToken, user}});
    }catch(err){return res.status(400).json({ 
        message: "Login Failed" ,
        error:`error: ${(err as Error).name}: ${(err as Error).message}`
    });
    }
}


//==========================
export async function refreshAccessToken(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({
            message: "Refresh token is required"
        });
    }
    try {
        const refresh = await authService.refreshAccessToken(refreshToken);
        return res.status(200).json({message:"Refresh Token Successful",data:refresh});
    } catch (err) {return res.status(400).json({ 
        message: "Refresh Token Failed" ,
        error:`error: ${(err as Error).name}: ${(err as Error).message}`
    });
    }
}

//==========================
export async function logoutUser(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({
            message: "Refresh token is required"
        });
    }
    try {
        await authService.logoutUser(refreshToken);
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (err) {return res.status(400).json({ 
        message: "An error occurred" ,
        error:`error: ${(err as Error).name}: ${(err as Error).message}`
    });
    }
}
