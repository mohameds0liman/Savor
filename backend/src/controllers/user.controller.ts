import { Request ,Response } from "express";
import * as userService from "../services/user.service";

// Register a new user
export async function createUser(req:Request , res:Response) {
    const {name,email,password}=req.body

    //if any of the required fields are missing, return a 400 Bad Request response
    if(!name ||!email || !password){
        return res.status(400).json({
            message:"Name, Email and Password are required"
        })
    }
    
    //check if user already exists
    try{
        let user=await userService.getUserByEmail(email)
        if(user){
            return res.status(400).json({
                message:"User already exists"
            })    
        }else{
            const user=await userService.createUser(req.body)
            return res.status(201).json({
                message:"User Created Successfully",
                data:user
            })
            
            }   
    }catch(err){
        return res.status(500).json({
            message:"Internal Server Error",
            error:`error: ${(err as Error).name}: ${(err as Error).message}`
        })
    }
}



// Update an existing user Data and settings like image, bio, etc. but not password or email 
// password and email should be updated through a separate route with proper authentication and validation
export async function updateUser(req:Request , res:Response) {
    const userId = req.user?.id
    const changes = req.body
    //protect the route so that only the user can update their own data
    if(!userId){
        return res.status(403).json({
            message:"You are not authorized to update this user"
        })
    }

    if(!changes){
        return res.status(400).json({
            message:"Changes are required to update user"
        })
    }else{
        try{
            const user=await userService.updateUser(userId,changes)
            return res.status(200).json({
                message:"User Updated Successfully",
                data:user
            })
        }catch(err){
            return res.status(500).json({
                message:"Internal Server Error",
                error:`error: ${(err as Error).name}: ${(err as Error).message}`
            })
        }
    }
}
export async function changePassword(req:Request , res:Response) {
    const userId = req.user?.id
    const changes = req.body
    if(!changes.oldPassword || !changes.newPassword){
        return res.status(400).json({
            message:"Old Password and New Password are required"
        })
    }
    if(!userId){
        return res.status(403).json({
            message:"You are not authorized to change password for this user"
        })
    }

    try{
        const user=await userService.changePassword(userId,changes)
        return res.status(200).json({
            message:"Password Changed Successfully",
            data:user
        })
    }catch(err){
        return res.status(500).json({
            message:"Internal Server Error",
            error:`error: ${(err as Error).name}: ${(err as Error).message}`
        })
    }
}

// Get all users
export async function getUsers(req:Request , res:Response) {
    try{
        const users=await userService.getUsers()
        return res.status(200).json({
            message:"Users Fetched Successfully",
            data:users
        })
    }catch(err){
        return res.status(500).json({
            message:"Internal Server Error",
            error:`error: ${(err as Error).name}: ${(err as Error).message}`
        })
    }
}

// Delete a user
export async function deleteUser(req:Request , res:Response) {
    const userId = req. user?.id
    if(!userId){
        return res.status(403).json({
            message:"You are not authorized to delete this user"
        })
    }

    try{
        const user=await userService.deleteUser(userId)
        return res.status(200).json({
            message:"User Deleted Successfully",
            data:user
        })
    }catch(err){
        return res.status(500).json({
            message:"Internal Server Error",
            error:`error: ${(err as Error).name}: ${(err as Error).message}`
        })
    }
}


// User Favourite Recipes
export async function getFavourites(req:Request , res:Response) {
    const userId = req.user?.id
    try{
        const favourites=await userService.getFavourites(String(userId))
        return res.status(200).json({
            message:"Favourites Fetched Successfully",
            data:favourites
        })
    }catch(err){
        return res.status(500).json({
            message:"Internal Server Error",
            error:`error: ${(err as Error).name}: ${(err as Error).message}`
        })
    }
}

export async function addFavourite(req:Request , res:Response) {
    const {id} = req.params
    const userId = req.user?.id
    try{
        const user=await userService.addFavourite(String(userId),String(id))
        return res.status(200).json({
            message:"Favourite Added Successfully",
            data:user
        })
    }catch(err){
        return res.status(500).json({
            message:"Internal Server Error",
            error:`error: ${(err as Error).name}: ${(err as Error).message}`
        })
    }
}

export async function removeFavourite(req:Request , res:Response) {
    const {id} = req.params
    const userId = req.user?.id
    try{
        const user=await userService.removeFavourite(String(userId),String(id))
        return res.status(200).json({
            message:"Favourite Removed Successfully",
            data:user
        })
    }catch(err){
        return res.status(500).json({
            message:"Internal Server Error",
            error:`error: ${(err as Error).name}: ${(err as Error).message}`
        })
    }
}
