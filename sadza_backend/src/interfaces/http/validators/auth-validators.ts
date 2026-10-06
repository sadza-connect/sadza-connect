import { z } from 'zod';

export const registerSchema = z.object({
  accountType: z.enum(['personal', 'business']).default('personal'),
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters'),
  phoneNumber: z
    .string()
    .trim()
    .min(7, 'Phone number must be at least 7 characters')
    .max(25, 'Phone number must not exceed 25 characters')
    .optional(),
  province: z.string().trim().max(100).optional(),
  businessName: z.string().trim().max(150).optional(),
  sector: z.string().trim().max(100).optional(),
  businessStructure: z.string().trim().max(50).optional(),
});

export const loginSchema = z.object({
  identifier: z.string().trim().optional(),
  email: z.string().trim().toLowerCase().optional(),
  phoneNumber: z.string().trim().optional(),
  password: z.string().min(1, 'Password is required'),
}).refine(
  (data) => Boolean(data.identifier || data.email || data.phoneNumber),
  {
    message: 'Please provide your email address or phone number',
    path: ['identifier'],
  },
);

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const verifyEmailSchema = z.object({
  token: z
    .string()
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Verification code must be a 6-digit code'),
});

export const resendVerificationSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
});

export const verifyResetOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
  otp: z
    .string()
    .length(6, 'Reset code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Reset code must be a 6-digit code'),
});

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyResetOtpInput = z.infer<typeof verifyResetOtpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
