import { Email, PasswordHash, AccountStatus, UserRole } from '../value-objects/index.js';
import { ValidationError } from '../../shared/errors/index.js';

export interface UserParams {
  id: string;
  accountType: 'personal' | 'business';
  role: UserRole;
  fullName: string;
  email: Email;
  passwordHash: PasswordHash;
  phoneNumber?: string;
  province?: string;
  businessName?: string;
  sector?: string;
  businessStructure?: string;
  accountStatus: AccountStatus;
  isVerified: boolean;
  avatarUrl?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class User {
  public readonly id: string;
  public readonly accountType: 'personal' | 'business';
  public readonly role: UserRole;
  public readonly fullName: string;
  public readonly email: Email;
  public readonly passwordHash: PasswordHash;
  public readonly phoneNumber?: string;
  public readonly province?: string;
  public readonly businessName?: string;
  public readonly sector?: string;
  public readonly businessStructure?: string;
  public readonly accountStatus: AccountStatus;
  public readonly isVerified: boolean;
  public readonly avatarUrl?: string;
  public readonly lastLoginAt?: Date;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly deletedAt?: Date;

  constructor(params: UserParams) {
    this.validateId(params.id);
    this.validateFullName(params.fullName);

    this.id = params.id.trim();
    this.accountType = params.accountType;
    this.role = params.role;
    this.fullName = params.fullName.trim();
    this.email = params.email;
    this.passwordHash = params.passwordHash;
    this.phoneNumber = params.phoneNumber?.trim();
    this.province = params.province?.trim();
    this.businessName = params.businessName?.trim();
    this.sector = params.sector?.trim();
    this.businessStructure = params.businessStructure?.trim();
    this.accountStatus = params.accountStatus;
    this.isVerified = params.isVerified;
    this.avatarUrl = params.avatarUrl?.trim();
    this.lastLoginAt = params.lastLoginAt;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.deletedAt = params.deletedAt;
  }

  static create(
    params: Omit<
      UserParams,
      'accountStatus' | 'isVerified' | 'createdAt' | 'updatedAt'
    > & {
      accountStatus?: AccountStatus;
      isVerified?: boolean;
    },
  ): User {
    const now = new Date();
    return new User({
      ...params,
      accountStatus: params.accountStatus ?? AccountStatus.ACTIVE,
      isVerified: params.isVerified ?? false,
      createdAt: now,
      updatedAt: now,
    });
  }

  isActive(): boolean {
    return this.accountStatus === AccountStatus.ACTIVE;
  }

  canLogin(): boolean {
    if (this.accountStatus !== AccountStatus.ACTIVE) {
      return false;
    }
    return true;
  }

  markVerified(): User {
    return new User({
      ...this.toParams(),
      isVerified: true,
      updatedAt: new Date(),
    });
  }

  withPasswordHash(passwordHash: PasswordHash): User {
    return new User({
      ...this.toParams(),
      passwordHash,
      updatedAt: new Date(),
    });
  }

  toParams(): UserParams {
    return {
      id: this.id,
      accountType: this.accountType,
      role: this.role,
      fullName: this.fullName,
      email: this.email,
      passwordHash: this.passwordHash,
      phoneNumber: this.phoneNumber,
      province: this.province,
      businessName: this.businessName,
      sector: this.sector,
      businessStructure: this.businessStructure,
      accountStatus: this.accountStatus,
      isVerified: this.isVerified,
      avatarUrl: this.avatarUrl,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  private validateId(id: string): void {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new ValidationError('User id is required');
    }
  }

  private validateFullName(fullName: string): void {
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      throw new ValidationError('Full name must be at least 2 characters');
    }
    if (fullName.trim().length > 100) {
      throw new ValidationError('Full name must not exceed 100 characters');
    }
  }
}
