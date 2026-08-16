import { z } from "zod";

/* ---------- Create ---------- */

export const CreateRecipeSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  image: z.string().url(),
});

export type CreateRecipeDTO = z.infer<typeof CreateRecipeSchema>;


/* ---------- Update ---------- */

export const UpdateRecipeSchema = CreateRecipeSchema.partial();

export type UpdateRecipeDTO = z.infer<typeof UpdateRecipeSchema>;

