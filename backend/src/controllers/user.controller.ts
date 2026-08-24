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
    let user=await userService.getUserByEmail(email)
    if(user){
        return res.status(400).json({
            message:"User already exists"
        })    
    }else{
        try{
            const user=await userService.createUser(req.body)
            return res.status(201).json({
                message:"User Created Successfully",
                data:user
            })
        }catch(err){
            console.error(err)
            return res.status(500).json({
                message:"Internal Server Error"
            })
        }
    }   
}



 export async function LoginUser(req:Request , res:Response) {
    const {email,password}=req.body
    if(!email || !password){
        return res.status(400).json({
            message:"Email and Password are required"
        })
    }else{
        try{
            const user=await userService.LoginUser(String(email),String(password))
            if(!user){
                return res.status(400).json({
                    message:"Invalid Email or Password"
                })
            }
            return res.status(200).json(user)
        }catch(err){
            console.error(err)
            return res.status(500).json({
                message:"Internal Server Error"
            })
        }
    }
}
// Update an existing user Data and settings like image, bio, etc. but not password or email 
// password and email should be updated through a separate route with proper authentication and validation
export async function updateUser(req:Request , res:Response) {
    const {id} = req.params
    const changes = req.body

    if(!changes){
        return res.status(400).json({
            message:"Changes are required to update user"
        })
    }else{
        try{
            const user=await userService.updateUser(String(id),changes)
            return res.status(200).json({
                message:"User Updated Successfully",
                data:user
            })
        }catch(err){
            console.error(err)
            return res.status(500).json({
                message:"Internal Server Error"
            })
        }
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
        console.error(err)
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

// Delete a user
export async function deleteUser(req:Request , res:Response) {
    const {id} = req.params

    try{
        const user=await userService.deleteUser(String(id))
        return res.status(200).json({
            message:"User Deleted Successfully",
            data:user
        })
    }catch(err){
        console.error(err)
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
}


// User Favourite Recipes
export async function getFavourites(req:Request , res:Response) {
    const {userId} = req.params
    try{
        const favourites=await userService.getFavourites(String(userId))
        return res.status(200).json({
            message:"Favourites Fetched Successfully",
            data:favourites
        })
    }catch(err){
        console.error(err)
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

export async function addFavourite(req:Request , res:Response) {
    const {userId,recipeId} = req.params
    try{
        const user=await userService.addFavourite(String(userId),String(recipeId))
        return res.status(200).json({
            message:"Favourite Added Successfully",
            data:user
        })
    }catch(err){
        console.error(err)
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

export async function removeFavourite(req:Request , res:Response) {
    const {userId,recipeId} = req.params
    try{
        const user=await userService.removeFavourite(String(userId),String(recipeId))
        return res.status(200).json({
            message:"Favourite Removed Successfully",
            data:user
        })
    }catch(err){
        console.error(err)
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
}
