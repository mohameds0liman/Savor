import Recipe from "../models/Recipe"
import { CreateRecipeDTO ,UpdateRecipeDTO } from "../middlewares/validation/recipe.validation"


export async function createRecipe(data: CreateRecipeDTO) {
  return Recipe.create(data);
}


export async function getRecipes() {
  return Recipe.find();
}

export async function getRecipe(id:string){
  return Recipe.findById(id)
}

export async function updateRecipe(id:string ,data:UpdateRecipeDTO){
  return Recipe.findByIdAndUpdate(id,data,{ new: true })
}

export async function deleteRecipe(id:string){
  return Recipe.findByIdAndDelete(id)
}



