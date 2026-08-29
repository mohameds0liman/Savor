import bcrypt from 'bcrypt';
import { createHash } from "crypto";


export const hashRefreshToken = (token: string) =>
  createHash("sha256").update(token).digest("hex"
);

export async function hashPassword(password:string){
    const passwordHash = await bcrypt.hash(password,10)
    return passwordHash
}


export async function comparePassword(password:string,passwordHash:string){
    const isPasswordValid= await bcrypt.compare(password,passwordHash)
    return isPasswordValid
}