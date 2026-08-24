import User from "../models/User"
import{CreateUserDTO , UpdateUserDTO} from "../middlewares/validation/user.validation"

import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"



export async function createUser(data:CreateUserDTO,){

    try{
        const passwordHash=await bcrypt.hash(data.password,10)
        const HashedData={...data,passwordHash}

        const CreatedUser= await User.create(HashedData)
        let token=jwt.sign({id:CreatedUser._id},process.env.JWT_SECRET as string,{expiresIn:"1h"})
        return {message:"User Created Successfully", user:CreatedUser, token}
    }catch(err){
        console.error(err)
    }
}

export async function updateUser(id:string ,data:UpdateUserDTO){
    try{
        const UpdatedUser= await User.findByIdAndUpdate(id,data,{new:true ,runValidators:true})
        return UpdatedUser
    }catch(err){
        console.error(err)
    }
}

//check if user exists by email in our database, if exists return the user else return null
export async function getUserByEmail(email:string){
    try{
        const user= await User.findOne({email})
        return user
    }catch(err){
        console.error(err)
    }
}

export async function LoginUser(email:string,password:string){
    try{
        //select the passwordHash field since we have set select:false in the schema
        //we need it to be hidden in the response but we need it here to compare the password
        const user= await User.findOne({email}).select("+passwordHash")
        if(!user){
            return null
        }
        const isPasswordValid=await bcrypt.compare(password,user.passwordHash)
        if(!isPasswordValid){
            return null
        }
        return {
            message:"Login Successful",
            user,
            token:jwt.sign({email:user.email,id:user._id},process.env.JWT_SECRET as string,{expiresIn:"1h"})
        }
    }catch(err){
        console.error(err)
    }
}




export async function getUsers(){
    try{
        const users= await User.find()
        return users
    }catch(err){
        console.error(err)
    }

}


export async function deleteUser(id:string){
    try{
        const DeletedUser= await User.findByIdAndDelete(id)
        return DeletedUser
    }catch(err){
        console.error(err)
    }
}





// User Favourite Recipes


export async function getFavourites(userId:string){
    try{
        const favorites= await User.findById(userId).populate("favorites")
        return favorites
    }catch(err){
        console.error(err)
    }
}


export async function addFavourite(userId:string,recipeId:string){
    try{
        const user= await User.findByIdAndUpdate(
            userId,{$addToSet: {favorites: recipeId}},{new:true,runValidators:true});
        return user
    }catch(err){
        console.error(err)
    }
}

export async function removeFavourite(userId:string,recipeId:string){
    try{
        const user= await User.findByIdAndUpdate(
            userId,{$pull: {favorites: recipeId}},{new:true,runValidators:true});
        return user
    }catch(err){
        console.error(err)
    }
}