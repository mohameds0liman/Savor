// Mirrors backend/src/middlewares/validation/recipe.validation.ts and
// backend/src/models/Recipe.ts exactly (see memory.md §2.5 / §2.7).

export type Difficulty = "easy" | "medium" | "hard";

export type Ingredient = {
  name: string;
  quantity: number;
  unit?: string;
};

export type RecipeOwner = {
  _id: string;
  name: string;
  image?: string | null;
};

// Full Recipe document as returned by the backend.
// `owner` is populated with { _id, name, image } by read endpoints.
export type Recipe = {
  _id: string;
  name: string;
  brief: string;
  description?: string;
  instructions: string[];
  image: string;
  ingredients: Ingredient[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: Difficulty;
  category: string;
  tags: string[];
  owner: string | RecipeOwner;
  rating: number;
  ratingsCount: number;
  views: number;
  createdAt: string;
  updatedAt: string;
};

// Mirrors CreateRecipeSchema exactly (backend/src/middlewares/validation/recipe.validation.ts).
export type CreateRecipeInput = {
  name: string;
  brief: string;
  description?: string;
  image: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number;
  cookTime?: number;
  servings: number;
  difficulty?: Difficulty;
  category: string;
  tags?: string[];
};

// Mirrors UpdateRecipeSchema (CreateRecipeSchema.partial()) — every field optional.
export type UpdateRecipeInput = Partial<CreateRecipeInput>;
