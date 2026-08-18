import { z } from "zod";

/* ---------- Shared ---------- */

const IngredientSchema = z.object({
  name: z
    .string()
    .min(1, "Ingredient name is required")
    .max(100),

  quantity: z
    .number()
    .positive("Quantity must be greater than 0"),

  unit: z
    .string()
    .max(30)
    .optional(),
});


/* ---------- Create ---------- */

export const CreateRecipeSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(150),

  brief: z
    .string()
    .min(10)
    .max(300),

  description: z
    .string()
    .min(10)
    .max(3000)
    .optional(),

  image: z
    .string()
    .url(),

  ingredients: z
    .array(IngredientSchema)
    .min(1, "At least one ingredient is required"),

  instructions: z
    .array(
      z.string().min(3).max(1000)
    )
    .min(1, "At least one instruction is required"),

  prepTime: z
    .number()
    .int()
    .min(0),

  cookTime: z
    .number()
    .int()
    .min(0)
    .default(0),

  servings: z
    .number()
    .int()
    .min(1),

  difficulty: z
    .enum(["easy", "medium", "hard"])
    .default("easy"),

  category: z
    .string()
    .min(2)
    .max(50),

  tags: z
    .array(
      z.string().min(1).max(30)
    )
    .default([]),
});

export type CreateRecipeDTO = z.infer<
  typeof CreateRecipeSchema
>;


/* ---------- Update ---------- */

export const UpdateRecipeSchema =
  CreateRecipeSchema.partial();

export type UpdateRecipeDTO = z.infer<
  typeof UpdateRecipeSchema
>;