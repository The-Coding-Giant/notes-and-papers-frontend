import { z } from "zod";

/** Input-type rules from .agents/ux_standards.md (Input Validation Rules). */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const looksLikeEmail = /@.*\./;
const pureNumber = /^\d+$/;

export const MAX_TEXTAREA = 500;

export const emailField = z
  .string()
  .min(1, "Email is required")
  .regex(emailRegex, "Please enter a valid email address (e.g. name@domain.com)");

export const nameField = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(80, "Name is too long")
  .refine((v) => !looksLikeEmail.test(v), "This field cannot be a number or email address")
  .refine((v) => !pureNumber.test(v), "This field cannot be a number or email address");

export const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters with 1 uppercase, 1 number, and 1 symbol")
  .regex(/[A-Z]/, "Password must be at least 8 characters with 1 uppercase, 1 number, and 1 symbol")
  .regex(/\d/, "Password must be at least 8 characters with 1 uppercase, 1 number, and 1 symbol")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must be at least 8 characters with 1 uppercase, 1 number, and 1 symbol",
  );

export const messageField = z
  .string()
  .min(1, "Message is required")
  .max(MAX_TEXTAREA, "Maximum 500 characters allowed");

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
});

export const forgotPasswordSchema = z.object({ email: emailField });

export const contactSchema = z.object({
  name: nameField,
  email: emailField,
  message: messageField,
});

export const reportSchema = z.object({
  reason: z.enum(["broken", "wrong", "takedown", "other"]),
  email: emailField,
  details: messageField,
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ContactValues = z.infer<typeof contactSchema>;

/** 0-4 score for the password strength meter. */
export function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
