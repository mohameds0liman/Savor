import {Router} from "express"
import rateLimit from "express-rate-limit";
import { validate } from "../middlewares/validate.middleware";
import {auth} from "../middlewares/auth.middleware"

import {CreateUserSchema,UpdateUserSchema,ChangePasswordSchema} from "../middlewares/validation/user.validation"
import {
createUser, updateUser,changePassword, getUsers, deleteUser,getFavourites,addFavourite,removeFavourite
} 
from "../controllers/user.controller"



const router=Router()

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post("/signup",validate(CreateUserSchema),createUser)
router.patch("/user",authLimiter,auth,validate(UpdateUserSchema),updateUser)
// router.patch("/users/:id",authLimiter,auth,validate(UpdateUserSchema),updateUser)
router.get("/user",authLimiter,auth,getUsers)
router.delete("/user",authLimiter,auth,deleteUser)
router.put("/user/password",authLimiter,auth,validate(ChangePasswordSchema),changePassword)
router.get("/user/favourites",authLimiter,auth,getFavourites)
router.post("/user/favourites/:id",authLimiter,auth,addFavourite)
router.delete("/user/favourites/:id",authLimiter,auth,removeFavourite)
export default router