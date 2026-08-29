import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long").max(100, "Password is too long"),
});


export const RefreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export type LoginUserDTO = z.infer<typeof LoginSchema>;
export type RefreshTokenDTO = z.infer<typeof RefreshSchema>;