import {Router} from "express"

import { validate  } from "../middlewares/validate.middleware";

// auth

import {CreateUserSchema} from "../middlewares/validation/user.validation"
import {
createUser, LoginUser, updateUser, getUsers, deleteUser
} 
from "../controllers/user.controller"







const router=Router()


router.post("/signup",createUser)//validate(CreateUserSchema)
router.post("/login",LoginUser)
router.patch("/users/:id",updateUser)
router.get("/users",getUsers)
router.delete("/users/:id",deleteUser)


export default router