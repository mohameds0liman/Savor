
import { Request, Response } from "express";
import * as recipeService from "../services/recipe.service";

export async function createRecipe(req: Request, res: Response) {
  try {
    const userId = req.user?.id
    const data = req.body
    const recipe = await recipeService.createRecipe(userId!, data);
    res.status(201).json({message:"Recipe Created Successfully",data:recipe});
  } catch (err) {res.status(500).json({ 
      message: "Internal Server Error",
      error:`error: ${(err as Error).name}: ${(err as Error).message}`
    });
  }
}

export async function getRecipes(req: Request, res: Response) {
  try {
    const recipes = await recipeService.getRecipes();
    res.json({message:"Recipes Fetched Successfully",data:recipes});
  } catch (err) {
    res.status(500).json({ 
    message: "Internal Server Error",
    error:`error: ${(err as Error).name}: ${(err as Error).message}`
  });
  }
}

export async function getRecipe(req: Request<{ id: string }>, res: Response) {
  try {
    const recipe = await recipeService.getRecipe(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json({message:"Recipe Fetched Successfully",data:recipe});
  } catch (err) {res.status(500).json({ 
    message: "Internal Server Error",
    error:`error: ${(err as Error).name}: ${(err as Error).message}`
  });
  }
}

export async function getUserRecipes(req: Request, res: Response) {
  const userId = req.user?.id
  try {
    const recipes = await recipeService.getUserRecipes(String(userId));
    if (!recipes) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json({message:"Recipes Fetched Successfully",data:recipes});
  } catch (err) {res.status(500).json({ 
    message: "Internal Server Error",
    error:`error: ${(err as Error).name}: ${(err as Error).message}`
  });
  }
}

export async function updateRecipe(req: Request<{ id: string }>, res: Response) {                                                                        
  try {                                                                                                                                                  
    const recipe = await recipeService.getRecipe(req.params.id);                                                                                         
    if (!recipe) {                                                                                                                                       
      return res.status(404).json({ message: "Recipe not found" });                                                                                      
    }                                                                                                                                                    
                                                                                                                                                             
    const ownerId = (recipe.owner as any)?._id                                                                                                           
      ? (recipe.owner as any)._id.toString()                                                                                                             
      : recipe.owner.toString();                                                                                                                         
                                                                                                                                                             
    if (req.user?.id !== ownerId) {                                                                                                                      
      return res.status(403).json({ message: "You are not authorized to update this recipe" });                                                          
    }                                                                                                                                                    
                                                                                                                                                             
    const updatedRecipe = await recipeService.updateRecipe(req.params.id, req.body);                                                                     
    res.status(200).json({ message: "Recipe Updated Successfully", data: updatedRecipe });                                                               
  } catch (err) {                                                                                                                                        
    res.status(500).json({                                                                                                                               
      message: "Internal Server Error",                                                                                                                  
      error: `error: ${(err as Error).name}: ${(err as Error).message}`                                                                                  
    });                                                                                                                                                  
  }                                                                                                                                                      
}    

export async function addRating(req: Request<{ id: string }>, res: Response) {                                                                           
  try {                                                                                                                                                  
    const { rating } = req.body;                                                                                                                         
    const updatedRecipe = await recipeService.addRating(req.params.id, rating);                                                                          
    res.status(200).json({ message: "Recipe Rated Successfully", data: updatedRecipe });                                                                 
  } catch (err) {                                                                                                                                        
    res.status(500).json({                                                                                                                               
      message: "Internal Server Error",                                                                                                                  
      error: `error: ${(err as Error).name}: ${(err as Error).message}`                                                                                  
    });                                                                                                                                                  
  }                                                                                                                                                      
}   

    
export async function deleteRecipe(req: Request<{ id: string }>, res: Response) {
  try {
    const recipe = await recipeService.getRecipe(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    const ownerId = (recipe.owner as any)?._id
      ? (recipe.owner as any)._id.toString()
      : recipe.owner.toString();

    if (req.user?.id !== ownerId) {
      return res.status(403).json({ message: "You are not authorized to delete this recipe" });
    }
    const deletedRecipe = await recipeService.deleteRecipe(req.params.id);
    res.status(200).json({ message: "Recipe Deleted Successfully", data: deletedRecipe });
  } catch (err) {
    res.status(500).json({ 
      message: "Internal Server Error",
      error: `error: ${(err as Error).name}: ${(err as Error).message}`
    });
  }
}