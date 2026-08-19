import User from "../models/User"
import{CreateUserDTO , UpdateUserDTO} from "../middlewares/validation/user.validation"

export async function createUser(data:CreateUserDTO){
    try{
        const CreatedUser= await User.create(data)
        return CreatedUser
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

// export async function getUser(id:string){
//     try{
//         const user= await User.findById(id)
//         return user
//     }catch(err){
//         console.error(err)
//     }
// }

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