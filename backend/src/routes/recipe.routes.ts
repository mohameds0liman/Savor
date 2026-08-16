import { Router } from "express";

import { validate } from "../middlewares/validate.middleware";

import {
    CreateRecipeSchema,
    UpdateRecipeSchema
} from "../middlewares/validation/recipe.validation"

import {
    createRecipe,
    updateRecipe,
    getRecipes,
    getRecipe,
    deleteRecipe
} from "../controllers/recipe.controller";

const router = Router();

///////////
router.post("/recipes",validate(CreateRecipeSchema),createRecipe);

router.patch("/recipes/:id",validate(UpdateRecipeSchema),updateRecipe);

router.get("/recipes" , getRecipes);
router.get("/recipes/:id" , getRecipe);

router.delete("/recipes/:id",deleteRecipe)
///////////

export default router;