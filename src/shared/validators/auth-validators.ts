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
    .max(255, 'Email must not exceed 255 characters')
    .refine((val) => {
      const domain = val.split('@')[1];
      const typoDomains = ['gmai.com', 'gamil.com', 'gmial.com', 'gmaill.com', 'hotmial.com', 'yaho.com', 'outlok.com'];
      return !typoDomains.includes(domain);
    }, {
      message: 'Email domain has a typo (e.g., gmai.com instead of gmail.com). Please check spelling.',
    }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters'),
  phoneNumber: z
    .string()
    .trim()
    .regex(
      /^\+?[0-9\s\-()]{7,25}$/,
      'Phone number must contain only digits and standard phone symbols (+, -, spaces, parentheses)',
    )
    .refine((val) => {
      const digits = val.replace(/\D/g, '');
      return digits.length >= 7 && digits.length <= 15;
    }, {
      message: 'Phone number must contain between 7 and 15 digits',
    })
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

export const forgotPasswordSchema = z
  .object({
    email: z.string().trim().toLowerCase().optional(),
    identifier: z.string().trim().optional(),
  })
  .refine((data) => Boolean(data.email || data.identifier), {
    message: 'Please provide your registered email address or phone number',
    path: ['identifier'],
  });

export const verifyResetOtpSchema = z
  .object({
    email: z.string().trim().toLowerCase().optional(),
    identifier: z.string().trim().optional(),
    otp: z
      .string()
      .length(6, 'Reset code must be exactly 6 digits')
      .regex(/^\d{6}$/, 'Reset code must be a 6-digit code'),
  })
  .refine((data) => Boolean(data.email || data.identifier), {
    message: 'Please provide your registered email address or phone number',
    path: ['identifier'],
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
