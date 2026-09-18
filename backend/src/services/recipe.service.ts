import Recipe from "../models/Recipe"
import { CreateRecipeDTO ,UpdateRecipeDTO } from "../middlewares/validation/recipe.validation"


export async function createRecipe(userId:string, data: CreateRecipeDTO) {
  const CreatedRecipe= await Recipe.create({...data,owner: userId})
  if(!CreatedRecipe){throw new Error("Recipe Creation Failed")}
  return CreatedRecipe
}


export async function getRecipes() {
  const recipes= await Recipe.find()
  if(!recipes){return null}
  return recipes
  
}

export async function getRecipe(id:string){
  const recipe= await Recipe.findById(id)
  if(!recipe){return null}
  recipe.views=recipe.views+1
  await recipe.save()
  return recipe
}

export async function getUserRecipes(userId:string){
  const recipes= await Recipe.find({owner:userId})
  if(!recipes){return null}
  return recipes
}

export async function updateRecipe(id:string ,data:UpdateRecipeDTO){
  const UpdatedRecipe= await Recipe.findByIdAndUpdate(id,data,{new:true ,runValidators:true})
  if(!UpdatedRecipe){throw new Error("Recipe Update Failed")}
  return UpdatedRecipe
}

export async function deleteRecipe(id:string){
    const DeletedRecipe= await Recipe.findByIdAndDelete(id)
    if(!DeletedRecipe){throw new Error("Recipe Deletion Failed")}
    return DeletedRecipe
}


