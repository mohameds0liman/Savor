import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../middlewares/validate.middleware";
import {auth} from "../middlewares/auth.middleware"
import {
    CreateRecipeSchema,
    UpdateRecipeSchema
} from "../middlewares/validation/recipe.validation"

import {
    createRecipe,
    updateRecipe,
    getRecipes,
    getRecipe,
    getUserRecipes,
    deleteRecipe
} from "../controllers/recipe.controller";

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
///////////
router.post("/recipe",authLimiter,auth,validate(CreateRecipeSchema),createRecipe);

router.patch("/recipe/:id",authLimiter,auth,validate(UpdateRecipeSchema),updateRecipe);

router.get("/recipe" , getRecipes);
router.get("/recipe/my" ,authLimiter,auth,getUserRecipes);
router.get("/recipe/:id" , getRecipe);

router.delete("/recipe/:id",authLimiter,auth,deleteRecipe)
///////////

export default router;