import Recipe from "../models/Recipe"
import { CreateRecipeDTO ,UpdateRecipeDTO } from "../middlewares/validation/recipe.validation"


export async function createRecipe(userId:string, data: CreateRecipeDTO) {
  const CreatedRecipe= await Recipe.create({...data,owner: userId})
  if(!CreatedRecipe){throw new Error("Recipe Creation Failed")}
  return CreatedRecipe
}


export async function getRecipes() {
  const recipes = await Recipe.find().populate("owner", "name image");
  if (!recipes) { return null; }
  return recipes;
}

export async function getRecipe(id: string) {
  const recipe = await Recipe.findById(id).populate("owner", "name image");
  if (!recipe) { return null; }
  recipe.views = (recipe.views || 0) + 1;
  await recipe.save();
  return recipe;
}

export async function getUserRecipes(userId: string) {
  const recipes = await Recipe.find({ owner: userId }).populate("owner", "name image");
  if (!recipes) { return null; }
  return recipes;
}

export async function updateRecipe(id: string, data: UpdateRecipeDTO) {                                                                                  
  const UpdatedRecipe = await Recipe.findByIdAndUpdate(id, data, {                                                                                       
    new: true,                                                                                                                                           
    runValidators: true,                                                                                                                                 
  }).populate("owner", "name image");                                                                                                                    
  if (!UpdatedRecipe) {                                                                                                                                  
    throw new Error("Recipe Update Failed");                                                                                                             
  }                                                                                                                                                      
  return UpdatedRecipe;                                                                                                                                  
}  

export async function addRating(id: string, rating: number) {                                                                                            
  const recipe = await Recipe.findById(id);                                                                                                              
  if (!recipe) {                                                                                                                                         
    throw new Error("Recipe not found");                                                                                                                 
  }                                                                                                                                                      
                                                                                                                                                             
  const currentCount = recipe.ratingsCount || 0;                                                                                                         
  const currentRating = recipe.rating || 0;                                                                                                              
  const newCount = currentCount + 1;                                                                                                                     
                                                                                                                                                             
  recipe.rating = Number((((currentRating * currentCount) + rating) / newCount).toFixed(1));                                                             
  recipe.ratingsCount = newCount;                                                                                                                        
  await recipe.save();                                                                                                                                   
                                                                                                                                                             
  return await Recipe.findById(id).populate("owner", "name image");                                                                                      
}      

export async function deleteRecipe(id:string){
    const DeletedRecipe= await Recipe.findByIdAndDelete(id)
    if(!DeletedRecipe){throw new Error("Recipe Deletion Failed")}
    return DeletedRecipe
}


