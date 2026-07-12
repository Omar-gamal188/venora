import { z } from "zod";

const username = z
  .string({ message: "username is required" })
  .trim()
  .min(2, "username must be at least 2 characters")
  .max(64, "username is too long")
  .regex(
    /^[a-zA-Z0-9._-]+$/,
    "username may only contain letters, numbers, dots, dashes and underscores",
  );

const password = z
  .string({ message: "password is required" })
  .min(8, "password must be at least 8 characters")
  .max(128, "password is too long");

const email = z
  .string({ message: "email is required" })
  .trim()
  .toLowerCase()
  .email("invalid email address")
  .max(128, "email is too long");

export const registerSchema = z.object({
  username,
  password,
  email,
  fullName: z
    .string({ message: "full name is required" })
    .trim()
    .min(1, "username, password, email, and full name are required")
    .max(128, "full name is too long"),
  phone: z.string().trim().max(32, "phone is too long").optional().default(""),
  address: z.string().trim().max(512, "address is too long").optional().default(""),
});

export const loginSchema = z.object({
  username: z.string({ message: "username and password required" }).trim().min(1, "username and password required").max(64),
  password: z.string({ message: "username and password required" }).min(1, "username and password required").max(128),
  rememberMe: z.boolean().optional().default(true),
});

export const refreshSchema = z.object({
  refreshToken: z.string().max(256).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string({ message: "current password is required" }).min(1).max(128),
  newPassword: password,
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string({ message: "token is required" }).min(16).max(256),
  newPassword: password,
});

export const verifyEmailSchema = z.object({
  token: z.string({ message: "token is required" }).min(16).max(256),
});
