import type { User } from '../../domain/index.js';

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
