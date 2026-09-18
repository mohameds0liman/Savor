import { z } from "zod";


export const CreateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long"),

  email: z
    .email("Invalid email address")
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
});

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(8, "Old password must be at least 8 characters").max(100),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(100)
});


export type CreateUserDTO = z.infer<typeof CreateUserSchema>;

//update user schema is a partial of create user schema, meaning that all fields are optional

export const UpdateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long").optional(),
  image: z.string().url("Image must be a valid URL").or(z.literal("")).nullable().optional(),
});

export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;
export type ChangePasswordDTO = z.infer<typeof ChangePasswordSchema>;