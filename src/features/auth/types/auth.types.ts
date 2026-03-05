import { z } from "zod";

// ─── Zod Schemas ──────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
  password: z.string().min(6, "הסיסמה חייבת להכיל לפחות 6 תווים"),
});

export const signupSchema = z
  .object({
    fullName: z.string().min(2, "שם מלא חייב להכיל לפחות 2 תווים"),
    email: z.string().email("כתובת אימייל לא תקינה"),
    password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "הסיסמות אינן תואמות",
    path: ["confirmPassword"],
  });

export const onboardingStep1Schema = z.object({
  companyName: z.string().min(2, "שם העסק חייב להכיל לפחות 2 תווים"),
  registrationNumber: z.string().optional(),
});

export const onboardingStep2Schema = z.object({
  skip: z.boolean().optional(),
  phoneNumberId: z.string().optional(),
  accessToken: z.string().optional(),
});

export const onboardingStep3Schema = z.object({
  skip: z.boolean().optional(),
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  debtTitle: z.string().optional(),
  debtAmount: z.coerce.number().positive().optional(),
  debtDueDate: z.string().optional(),
});

// ─── Inferred Types ───────────────────────────────────────────

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type OnboardingStep1Data = z.infer<typeof onboardingStep1Schema>;
export type OnboardingStep2Data = z.infer<typeof onboardingStep2Schema>;
export type OnboardingStep3Data = z.infer<typeof onboardingStep3Schema>;

export type AuthActionResult =
  | { success: true }
  | { success: false; error: string };
