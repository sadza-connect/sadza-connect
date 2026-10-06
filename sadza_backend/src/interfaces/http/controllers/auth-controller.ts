import type { Request, Response } from 'express';
import type { User } from '../../../domain/index.js';
import { AuthService } from '../../../application/auth/auth-service.js';
import { UserRepository } from '../../../infrastructure/database/repositories/user-repository.js';
import { asyncHandler } from '../../../shared/utils/index.js';
import { AuthenticationError, NotFoundError } from '../../../shared/errors/index.js';
import type { AuthenticatedRequest } from '../middleware/authenticate.js';

const authService = new AuthService();
const userRepo = new UserRepository();

export function sanitizeUser(user: User) {
  return {
    id: user.id,
    accountType: user.accountType,
    role: user.role,
    fullName: user.fullName,
    email: user.email.getValue(),
    phoneNumber: user.phoneNumber ?? null,
    province: user.province ?? null,
    businessName: user.businessName ?? null,
    sector: user.sector ?? null,
    businessStructure: user.businessStructure ?? null,
    accountStatus: user.accountStatus,
    isVerified: user.isVerified,
    avatarUrl: user.avatarUrl ?? null,
    lastLoginAt: user.lastLoginAt ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const {
    accountType,
    fullName,
    email,
    password,
    phoneNumber,
    province,
    businessName,
    sector,
    businessStructure,
  } = req.body;

  const { user } = await authService.register({
    accountType: accountType ?? 'personal',
    fullName,
    email,
    password,
    phoneNumber,
    province,
    businessName,
    sector,
    businessStructure,
  });

  res.status(201).json({
    success: true,
    data: {
      user: sanitizeUser(user),
    },
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, email, phoneNumber, password } = req.body;
  const loginIdentifier = (identifier || email || phoneNumber) as string;

  if (!loginIdentifier) {
    throw new AuthenticationError('Please enter your email or phone number');
  }

  const { user, tokens } = await authService.login(
    loginIdentifier,
    password,
    req.headers['user-agent'] as string | undefined,
    req.ip,
  );

  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AuthenticationError('Refresh token is required');
  }

  const { user, tokens } = await authService.refresh(
    refreshToken,
    req.headers['user-agent'] as string | undefined,
    req.ip,
  );

  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  const { user } = await authService.verifyEmail(token);

  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(user),
    },
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  await authService.resendVerification(email);

  res.status(200).json({
    success: true,
    data: null,
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  await authService.forgotPassword(email);

  res.status(200).json({
    success: true,
    data: null,
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
});

export const verifyResetOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const { resetToken } = await authService.verifyResetOtp(email, otp);

  res.status(200).json({
    success: true,
    data: {
      resetToken,
    },
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { resetToken, password } = req.body;

  await authService.resetPassword(resetToken, password);

  res.status(200).json({
    success: true,
    data: null,
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  res.status(200).json({
    success: true,
    data: null,
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  const user = await userRepo.findById(authReq.user.id);

  if (!user) {
    throw new NotFoundError('User');
  }

  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(user),
    },
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
});
