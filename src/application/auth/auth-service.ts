import bcrypt from 'bcryptjs';
import { randomInt, randomUUID } from 'node:crypto';
import {
  User,
  Email,
  PasswordHash,
  UserRole,
  AccountStatus,
} from '../../domain/index.js';
import { UserRepository } from '../../infrastructure/database/repositories/user-repository.js';
import { RefreshTokenRepository } from '../../infrastructure/database/repositories/refresh-token-repository.js';
import { EmailVerificationTokenRepository } from '../../infrastructure/database/repositories/email-verification-token-repository.js';
import { PasswordResetTokenRepository } from '../../infrastructure/database/repositories/password-reset-token-repository.js';
import { EmailService } from '../../infrastructure/messaging/email-service.js';
import { JwtService } from './jwt-service.js';
import { env } from '../../config/env.js';
import {
  ConflictError,
  AuthenticationError,
  NotFoundError,
  TokenExpiredError,
} from '../../shared/errors/index.js';

export interface RegisterParams {
  accountType: 'personal' | 'business';
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  province?: string;
  businessName?: string;
  sector?: string;
  businessStructure?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterResult {
  user: User;
}

export class AuthService {
  private readonly jwtService: JwtService;
  private readonly emailService: EmailService;

  constructor(
    private readonly userRepo: UserRepository = new UserRepository(),
    private readonly refreshTokenRepo: RefreshTokenRepository = new RefreshTokenRepository(),
    private readonly verificationTokenRepo: EmailVerificationTokenRepository = new EmailVerificationTokenRepository(),
    private readonly passwordResetTokenRepo: PasswordResetTokenRepository = new PasswordResetTokenRepository(),
  ) {
    this.jwtService = new JwtService();
    this.emailService = new EmailService();
  }

  async register(params: RegisterParams): Promise<RegisterResult> {
    const existingEmail = await this.userRepo.findByEmail(params.email);
    if (existingEmail && existingEmail.isVerified) {
      throw new ConflictError('An account with this email address already exists. Please sign in.');
    }

    if (params.phoneNumber) {
      const existingPhone = await this.userRepo.findByPhone(params.phoneNumber);
      if (existingPhone && existingPhone.isVerified && existingPhone.id !== existingEmail?.id) {
        throw new ConflictError('An account with this phone number already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(params.password, env.BCRYPT_SALT_ROUNDS);
    const role = params.accountType === 'business' ? UserRole.MERCHANT : UserRole.CUSTOMER;

    let targetUser: User;

    if (existingEmail && !existingEmail.isVerified) {
      const updatedUser = new User({
        ...existingEmail.toParams(),
        accountType: params.accountType,
        role,
        fullName: params.fullName,
        passwordHash: PasswordHash.create(hashedPassword),
        phoneNumber: params.phoneNumber,
        province: params.province,
        businessName: params.businessName,
        sector: params.sector,
        businessStructure: params.businessStructure,
        updatedAt: new Date(),
      });
      targetUser = await this.userRepo.update(updatedUser);
      await this.verificationTokenRepo.invalidateForUser(targetUser.id);
    } else {
      const user = User.create({
        id: randomUUID(),
        accountType: params.accountType,
        role,
        fullName: params.fullName,
        email: Email.create(params.email),
        passwordHash: PasswordHash.create(hashedPassword),
        phoneNumber: params.phoneNumber,
        province: params.province,
        businessName: params.businessName,
        sector: params.sector,
        businessStructure: params.businessStructure,
        accountStatus: AccountStatus.ACTIVE,
        isVerified: false,
      });
      targetUser = await this.userRepo.create(user);
    }

    // Generate 6-digit email verification OTP
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.verificationTokenRepo.create({
      id: randomUUID(),
      userId: targetUser.id,
      token: otp,
      expiresAt,
    });

    await this.emailService.sendVerificationEmail(targetUser.email.getValue(), otp);

    return { user: targetUser };
  }

  async login(
    identifier: string,
    password: string,
    deviceFingerprint?: string,
    ipAddress?: string,
  ): Promise<AuthResult> {
    const user = await this.userRepo.findByEmailOrPhone(identifier);
    if (!user) {
      throw new AuthenticationError('Invalid email, phone number, or password');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash.getValue());
    if (!isValid) {
      throw new AuthenticationError('Invalid email, phone number, or password');
    }

    if (!user.canLogin()) {
      throw new AuthenticationError('This account has been deactivated or suspended');
    }

    await this.userRepo.updateLastLogin(user.id);
    const tokens = await this.generateTokens(user, undefined, deviceFingerprint, ipAddress);

    return { user, tokens };
  }

  async refresh(
    refreshToken: string,
    deviceFingerprint?: string,
    ipAddress?: string,
  ): Promise<AuthResult> {
    let payload;
    try {
      payload = this.jwtService.verifyRefreshToken(refreshToken);
    } catch {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const tokenHash = this.jwtService.hashToken(refreshToken);
    const storedToken = await this.refreshTokenRepo.findByTokenHash(tokenHash);

    // Reuse detection: If token record not found or already revoked, invalidate entire token family
    if (!storedToken || storedToken.revoked_at) {
      if (storedToken?.family_id) {
        await this.refreshTokenRepo.revokeFamily(storedToken.family_id);
      }
      throw new AuthenticationError('Refresh token has already been revoked or reused');
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      await this.refreshTokenRepo.revoke(tokenHash);
      throw new AuthenticationError('Refresh token has expired');
    }

    const user = await this.userRepo.findById(payload.sub);
    if (!user || !user.canLogin()) {
      throw new AuthenticationError('User account not found or inactive');
    }

    // Single-use token rotation: revoke used token
    await this.refreshTokenRepo.revoke(tokenHash);

    // Issue new pair in the same family
    const newTokens = await this.generateTokens(
      user,
      storedToken.family_id,
      deviceFingerprint,
      ipAddress,
    );

    return { user, tokens: newTokens };
  }

  async verifyEmail(token: string): Promise<{ user: User; tokens: AuthTokens }> {
    const storedToken = await this.verificationTokenRepo.findByToken(token);
    if (!storedToken) {
      throw new AuthenticationError('Invalid 6-digit verification code. Please check your email or request a new code.');
    }

    if (storedToken.used_at) {
      throw new TokenExpiredError('This verification code has already been used.');
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      throw new TokenExpiredError('This verification code has expired. Please request a new code.');
    }

    const user = await this.userRepo.findById(storedToken.user_id);
    if (!user) {
      throw new AuthenticationError('User account associated with this verification code was not found.');
    }

    const verified = user.isVerified ? user : user.markVerified();
    const updated = user.isVerified ? user : await this.userRepo.update(verified);
    await this.verificationTokenRepo.markAsUsed(storedToken.id);

    const tokens = await this.generateTokens(updated);
    return { user: updated, tokens };
  }

  async resendVerification(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || user.isVerified) {
      return;
    }

    await this.verificationTokenRepo.invalidateForUser(user.id);

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.verificationTokenRepo.create({
      id: randomUUID(),
      userId: user.id,
      token: otp,
      expiresAt,
    });

    await this.emailService.sendVerificationEmail(user.email.getValue(), otp);
  }

  async forgotPassword(identifier: string): Promise<void> {
    const user = await this.userRepo.findByEmailOrPhone(identifier);
    if (!user) {
      return;
    }

    await this.passwordResetTokenRepo.invalidateForUser(user.id);

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await this.passwordResetTokenRepo.create({
      id: randomUUID(),
      userId: user.id,
      tokenHash: otp,
      expiresAt,
    });

    await this.emailService.sendResetPasswordEmail(user.email.getValue(), otp);
  }

  async verifyResetOtp(identifier: string, otp: string): Promise<{ resetToken: string }> {
    const user = await this.userRepo.findByEmailOrPhone(identifier);
    if (!user) {
      throw new AuthenticationError('No account found with this email or phone number.');
    }

    const storedToken = await this.passwordResetTokenRepo.findByOtp(otp);
    if (!storedToken || storedToken.user_id !== user.id) {
      throw new AuthenticationError('Invalid or expired 6-digit PIN. Please re-check or request a new code.');
    }

    if (storedToken.used_at) {
      throw new TokenExpiredError('This 6-digit PIN has already been used. Please request a new code.');
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      throw new TokenExpiredError('This 6-digit PIN has expired. Please request a new code.');
    }

    await this.passwordResetTokenRepo.markAsUsed(storedToken.id);

    const resetToken = this.jwtService.generatePasswordResetToken(user.id);
    return { resetToken };
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    let payload;
    try {
      payload = this.jwtService.verifyPasswordResetToken(resetToken);
    } catch {
      throw new AuthenticationError('Invalid or expired password reset token');
    }

    const user = await this.userRepo.findById(payload.sub);
    if (!user) {
      throw new NotFoundError('User');
    }

    const hashedPassword = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
    const updated = user.withPasswordHash(PasswordHash.create(hashedPassword));
    await this.userRepo.update(updated);

    // Invalidate all active refresh tokens/sessions for this user
    await this.refreshTokenRepo.revokeAllForUser(user.id);
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.jwtService.hashToken(refreshToken);
    await this.refreshTokenRepo.revoke(tokenHash);
  }

  private generateOtp(): string {
    return randomInt(100000, 999999).toString();
  }

  private async generateTokens(
    user: User,
    familyId?: string,
    deviceFingerprint?: string,
    ipAddress?: string,
  ): Promise<AuthTokens> {
    const accessToken = this.jwtService.generateAccessToken({
      userId: user.id,
      role: user.role,
      email: user.email.getValue(),
      accountType: user.accountType,
    });

    const { token: refreshToken, expiresAt } = this.jwtService.generateRefreshToken(user.id);

    await this.refreshTokenRepo.create({
      id: randomUUID(),
      userId: user.id,
      tokenHash: this.jwtService.hashToken(refreshToken),
      familyId: familyId ?? randomUUID(),
      expiresAt,
      deviceFingerprint,
      ipAddress,
    });

    return { accessToken, refreshToken };
  }
}
