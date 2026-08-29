import User from "../models/User"
import Session from "../models/Session"
import {hashRefreshToken,comparePassword} from "../utils/hash"
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    getRefreshTokenExpirationDate
} from "../utils/jwt"

//ask
type LoginMeta={
    userAgent?:string,
    ip:string
}


export async function loginUser(email:string,password:string,meta:LoginMeta){
    const user=await User.findOne({email}).select("+passwordHash")
    if(!user){throw new Error("User not found")}

    const isMatch=await comparePassword(password,user.passwordHash)
    if(!isMatch){throw new Error("Invalid email or password")}

    const accessToken =await generateAccessToken({ id: user._id.toString() });
    const refreshToken =await generateRefreshToken({ id: user._id.toString() });

    // if the user already has a session, delete it before creating a new one
    const sessionExists=await Session.findOne({user: user._id})
    if(sessionExists){
        await Session.deleteOne({user: user._id})
    }
    
    await Session.create({
        user: user._id,
        refreshToken: hashRefreshToken(String(refreshToken)),
        userAgent: meta.userAgent ?? null,
        ip: meta.ip ?? null,
        expiresAt: await getRefreshTokenExpirationDate(String(refreshToken)),
    })
    return {
        message: "Login successful",
        accessToken,
        refreshToken,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    }
}



export async function refreshAccessToken(refreshToken:string){
    const payload=await verifyRefreshToken(refreshToken)
    if(!payload){throw new Error("Invalid or expired refresh token")}

    const session=await Session.findOne({user: payload.id,refreshToken: hashRefreshToken(refreshToken),isValid: true,})
    if(!session){throw new Error("Session not found or invalid")}

    const newAccessToken=await generateAccessToken({id:payload.id})
    return {
        message:"Access token refreshed successfully",
        accessToken:newAccessToken,
        refreshToken:refreshToken
    }
}


export async function logoutUser(refreshToken:string){
    //we invalidate the session not delete it because we want to keep the session record for auditing purposes
    //and to whatch the user activity we Detect IP/userAgent and for security purpose
    const session=await Session.findOneAndUpdate({refreshToken: hashRefreshToken(refreshToken)},{isValid:false},{new:true})
    if(!session){throw new Error("Session not found")}
}