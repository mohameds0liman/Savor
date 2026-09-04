import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import { auth } from "../middlewares/auth.middleware";
import {
  CreateRecipeSchema,
  UpdateRecipeSchema,
} from "../middlewares/validation/recipe.validation";

import {
  createRecipe,
  updateRecipe,
  getRecipes,
  getRecipe,
  getUserRecipes,
  deleteRecipe,
} from "../controllers/recipe.controller";

const router = Router();

router.post("/recipe", auth, validate(CreateRecipeSchema), createRecipe);
router.patch("/recipe/:id", auth, validate(UpdateRecipeSchema), updateRecipe);

router.get("/recipe", getRecipes);
router.get("/recipe/my", auth, getUserRecipes);
router.get("/recipe/:id", getRecipe);

router.delete("/recipe/:id", auth, deleteRecipe);

export default router;