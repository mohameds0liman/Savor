
import { Request, Response } from "express";
import * as recipeService from "../services/recipe.service";

export async function createRecipe(req: Request, res: Response) {
  const recipe = await recipeService.createRecipe(req.body);

  res.status(201).json(recipe);
}

export async function getRecipes(req: Request, res: Response) {
  const recipes = await recipeService.getRecipes();

  res.json(recipes);
}

export async function getRecipe(req: Request<{ id: string }>, res: Response) {
  const recipe = await recipeService.getRecipe(req.params.id);

  res.json(recipe);
}

export async function updateRecipe(req: Request<{ id: string }>, res: Response) {
  const recipe = await recipeService.updateRecipe(req.params.id, req.body);

  res.status(201).json(recipe);
}

export async function deleteRecipe(req: Request<{ id: string }>, res: Response) {
  const recipe = await recipeService.deleteRecipe(req.params.id);

  res.status(201).json(recipe);
}