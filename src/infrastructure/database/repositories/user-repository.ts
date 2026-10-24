import { getDb } from '../connection.js';
import {
  User,
  Email,
  PasswordHash,
  accountStatusFromString,
  userRoleFromString,
} from '../../../domain/index.js';
import { InternalError } from '../../../shared/errors/index.js';
import type { Knex } from '../connection.js';

export interface UserRow {
  id: string;
  account_type: 'personal' | 'business';
  role: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  password_hash: string;
  province: string | null;
  business_name: string | null;
  sector: string | null;
  business_structure: string | null;
  status: string;
  is_verified: boolean;
  avatar_url: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function rowToUser(row: UserRow): User {
  return new User({
    id: row.id,
    accountType: row.account_type,
    role: userRoleFromString(row.role),
    fullName: row.full_name,
    email: Email.create(row.email),
    passwordHash: PasswordHash.create(row.password_hash),
    phoneNumber: row.phone_number ?? undefined,
    province: row.province ?? undefined,
    businessName: row.business_name ?? undefined,
    sector: row.sector ?? undefined,
    businessStructure: row.business_structure ?? undefined,
    accountStatus: accountStatusFromString(row.status),
    isVerified: Boolean(row.is_verified),
    avatarUrl: row.avatar_url ?? undefined,
    lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : undefined,
  });
}

export function userToRow(user: User): Omit<UserRow, 'created_at' | 'updated_at' | 'last_login_at' | 'deleted_at'> {
  return {
    id: user.id,
    account_type: user.accountType,
    role: user.role,
    full_name: user.fullName,
    email: user.email.getValue(),
    phone_number: user.phoneNumber ?? null,
    password_hash: user.passwordHash.getValue(),
    province: user.province ?? null,
    business_name: user.businessName ?? null,
    sector: user.sector ?? null,
    business_structure: user.businessStructure ?? null,
    status: user.accountStatus,
    is_verified: user.isVerified,
    avatar_url: user.avatarUrl ?? null,
  };
}

export class UserRepository {
  private db: Knex;

  constructor(db?: Knex) {
    this.db = db ?? getDb();
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.db<UserRow>('users')
      .where({ id })
      .whereNull('deleted_at')
      .first();

    return row ? rowToUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    const row = await this.db<UserRow>('users')
      .whereRaw('LOWER(email) = ?', [normalized])
      .whereNull('deleted_at')
      .first();

    return row ? rowToUser(row) : null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    // Normalize phone number (strip whitespace, hyphens, parentheses)
    const cleaned = phone.replace(/[\s\-()]/g, '');
    const variants = [
      cleaned,
      cleaned.startsWith('+') ? cleaned.slice(1) : `+${cleaned}`,
      cleaned.startsWith('0') ? `+263${cleaned.slice(1)}` : cleaned,
      cleaned.startsWith('+263') ? `0${cleaned.slice(4)}` : cleaned,
    ];

    const row = await this.db<UserRow>('users')
      .whereIn('phone_number', variants)
      .whereNull('deleted_at')
      .first();

    return row ? rowToUser(row) : null;
  }

  async findByEmailOrPhone(identifier: string): Promise<User | null> {
    const trimmed = identifier.trim();
    if (trimmed.includes('@')) {
      return this.findByEmail(trimmed);
    }
    return this.findByPhone(trimmed);
  }

  async create(user: User): Promise<User> {
    const row = userToRow(user);
    const [inserted] = await this.db<UserRow>('users')
      .insert({
        ...row,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      })
      .returning('*');

    if (!inserted) {
      throw new InternalError('Failed to create user record');
    }

    return rowToUser(inserted);
  }

  async update(user: User): Promise<User> {
    const row = userToRow(user);
    const [updated] = await this.db<UserRow>('users')
      .where({ id: user.id })
      .update({
        ...row,
        updated_at: new Date().toISOString(),
      })
      .returning('*');

    if (!updated) {
      throw new InternalError('Failed to update user record');
    }

    return rowToUser(updated);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.db<UserRow>('users')
      .where({ id: userId })
      .update({
        last_login_at: this.db.fn.now(),
      });
  }

  async findUsers(options: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: Omit<UserRow, 'password_hash' | 'deleted_at'>[]; total: number }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 50));
    const offset = (page - 1) * limit;

    let query = this.db<UserRow>('users').whereNull('deleted_at');

    if (options.search) {
      const term = `%${options.search.trim().toLowerCase()}%`;
      query = query.where((builder) => {
        builder
          .whereRaw('LOWER(full_name) LIKE ?', [term])
          .orWhereRaw('LOWER(email) LIKE ?', [term])
          .orWhereRaw('phone_number LIKE ?', [term])
          .orWhereRaw('LOWER(business_name) LIKE ?', [term]);
      });
    }

    if (options.role && options.role !== 'all') {
      query = query.where({ role: options.role.toLowerCase() });
    }

    if (options.status && options.status !== 'all') {
      query = query.where({ status: options.status.toLowerCase() });
    }

    const [{ count }] = await query.clone().count<{ count: string | number }[]>('* as count');
    const total = parseInt(count.toString(), 10);

    const users = await query
      .select(
        'id',
        'account_type',
        'role',
        'full_name',
        'email',
        'phone_number',
        'province',
        'business_name',
        'sector',
        'business_structure',
        'status',
        'is_verified',
        'avatar_url',
        'last_login_at',
        'created_at',
        'updated_at'
      )
      .orderBy('created_at', 'desc')
      .offset(offset)
      .limit(limit);

    return { users, total };
  }

  async updateRole(id: string, role: string): Promise<UserRow | null> {
    const [updated] = await this.db<UserRow>('users')
      .where({ id })
      .update({
        role: role.toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .returning('*');
    return updated || null;
  }

  async updateStatus(id: string, status: string): Promise<UserRow | null> {
    const [updated] = await this.db<UserRow>('users')
      .where({ id })
      .update({
        status: status.toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .returning('*');
    return updated || null;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<boolean> {
    const count = await this.db('users')
      .where({ id })
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      });
    return count > 0;
  }

  async softDelete(id: string): Promise<boolean> {
    const count = await this.db('users')
      .where({ id })
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    return count > 0;
  }
}

export const userRepository = new UserRepository();
