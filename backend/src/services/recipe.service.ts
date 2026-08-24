import Recipe from "../models/Recipe"
import { CreateRecipeDTO ,UpdateRecipeDTO } from "../middlewares/validation/recipe.validation"


export async function createRecipe(userId:string, data: CreateRecipeDTO) {
  try{
    const CreatedRecipe= await Recipe.create({...data,owner: userId})
    return CreatedRecipe
  }catch(err){
    console.error(err);
  }
}


export async function getRecipes() {
  try{
    const recipes= await Recipe.find()
    return recipes
  }catch(err){
    console.error(err);
  }
}

export async function getRecipe(id:string){
  try{
    const recipe= await Recipe.findById(id)
    return recipe
  }catch(err){
    console.error(err);
  }
}

export async function updateRecipe(id:string ,data:UpdateRecipeDTO){
  try{
    const UpdatedRecipe= await Recipe.findByIdAndUpdate(id,data,{new:true ,runValidators:true})
    return UpdatedRecipe
  }catch(err){
    console.error(err);
  }
}

export async function deleteRecipe(id:string){
  try{
    const DeletedRecipe= await Recipe.findByIdAndDelete(id)
    return DeletedRecipe
  }catch(err){
    console.error(err);
  }
}



