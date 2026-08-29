import User from "../models/User"
import{CreateUserDTO , UpdateUserDTO , ChangePasswordDTO} from "../middlewares/validation/user.validation"
import Session from "../models/Session"
import {hashRefreshToken,comparePassword, hashPassword} from "../utils/hash"
import {generateAccessToken,generateRefreshToken, getRefreshTokenExpirationDate} from "../utils/jwt"

export async function createUser(data:CreateUserDTO,){

    const passwordHash=await hashPassword(data.password)
    const HashedData={...data,passwordHash}


    const CreatedUser= await User.create(HashedData)
    if(!CreatedUser){throw new Error("User Creation Failed")}

    let accessToken=await generateAccessToken({id:CreatedUser._id.toString()})
    let refreshToken=await generateRefreshToken({id:CreatedUser._id.toString()})
    await Session.create({
        user: CreatedUser._id,
        refreshToken: hashRefreshToken(String(refreshToken)),
        expiresAt: await getRefreshTokenExpirationDate(String(refreshToken)),
    })
    //later i can use this response to auto login the user after registration
    return {message:"User Created Successfully", accessToken, refreshToken,
        user:{
            id:CreatedUser._id,
            name:CreatedUser.name,
            email:CreatedUser.email,
            role:CreatedUser.role
        }
    }
    
}

export async function updateUser(userId:string ,data:UpdateUserDTO){
    
    const UpdatedUser= await User.findByIdAndUpdate(userId,data,{new:true ,runValidators:true})
    if(!UpdatedUser){throw new Error("User Update Failed")}
    return UpdatedUser
}

export async function changePassword(userId:string ,changes:ChangePasswordDTO){

    const user= await User.findById(userId).select("+passwordHash")
    const isMatch=await comparePassword(changes.oldPassword,user?.passwordHash || "")
    if(!isMatch){throw new Error("Old password is incorrect")}

    const passwordHash=await hashPassword(changes.newPassword)
    const UpdatedUser= await User.findByIdAndUpdate(userId,{passwordHash},{new:true,runValidators:true})
    if(!UpdatedUser){throw new Error("Password Change Failed")}
    await Session.deleteMany({user:userId})
    return UpdatedUser
}

//check if user exists by email in our database, if exists return the user else return null
export async function getUserByEmail(email:string){
    const user= await User.findOne({email})
    if(!user){return null}
    return user
}


export async function getUsers(){
    const users= await User.find()
    if(!users){return null}
    return users
}


export async function deleteUser(userId:string){
    const DeletedUser= await User.findByIdAndDelete(userId)
    if(!DeletedUser){throw new Error("User Deletion Failed")}
    return DeletedUser
}


// User Favourite Recipes

export async function getFavourites(userId:string){
    const user= await User.findById(userId).populate("favorites").select("favorites")
    if(!user){return null}
    return user.favorites

}


export async function addFavourite(userId:string,id:string){

    const user= await User.findByIdAndUpdate(
        userId,{$addToSet: {favorites: id}},{new:true,runValidators:true});
    if(!user){throw new Error("Favourite Addition Failed")}
    return user
}

export async function removeFavourite(userId:string,id:string){

    const user= await User.findByIdAndUpdate(
        userId,{$pull: {favorites: id}},{new:true,runValidators:true});
    if(!user){throw new Error("Favourite Removal Failed")}
    return user
}