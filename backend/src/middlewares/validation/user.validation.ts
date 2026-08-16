import { z } from "zod";

export const RegisterSchema = z.object({
  username: z.string().min(3),
  email: z.email(),
  password: z.string().min(8),
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;