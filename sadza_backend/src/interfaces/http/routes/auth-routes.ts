import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { authRateLimiter, otpRateLimiter } from '../middleware/rate-limiter.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
  logoutSchema,
} from '../validators/auth-validators.js';
import {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getMe,
} from '../controllers/auth-controller.js';

const router = Router();

// Registration
router.post('/register', authRateLimiter, validate(registerSchema), register);

// Login (supports email OR phone number + password)
router.post('/login', authRateLimiter, validate(loginSchema), login);

// Refresh access token
router.post('/refresh', authRateLimiter, validate(refreshSchema), refresh);

// Email verification
router.post('/verify-email', authRateLimiter, validate(verifyEmailSchema), verifyEmail);
router.post(
  '/resend-verification',
  authRateLimiter,
  validate(resendVerificationSchema),
  resendVerification,
);

// Password recovery
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/verify-reset-otp', otpRateLimiter, validate(verifyResetOtpSchema), verifyResetOtp);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), resetPassword);

// Session termination
router.post('/logout', authRateLimiter, validate(logoutSchema), logout);

// Authenticated user profile
router.get('/me', authenticate, getMe);

export default router;
