// Mirrors backend/src/middlewares/validation/recipe.validation.ts and
// backend/src/models/Recipe.ts exactly (see memory.md §2.5 / §2.7).

export type Difficulty = "easy" | "medium" | "hard";

export type Ingredient = {
  name: string;
  quantity: number;
  unit?: string;
};

// Full Recipe document as returned by the backend.
// NOTE: `owner` is never populated by any read endpoint (memory.md bug #8) —
// it's always a raw ObjectId string, never an author name/object.
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
  owner: string;
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
