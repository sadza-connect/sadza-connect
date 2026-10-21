import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { userRepository } from '@/infrastructure/database/repositories/user-repository';
import { getAuthenticatedUser } from '@/shared/utils/auth-session';
import {
  jsonResponse,
  errorResponse,
  parseAndValidateBody,
} from '@/shared/utils/route-handler';
import { AuthorizationError, ConflictError, ValidationError } from '@/shared/errors/AppError';
import { User, Email, PasswordHash, AccountStatus } from '@/domain/index';

export const runtime = 'nodejs';

const createUserSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'merchant', 'customer']).default('customer'),
  phoneNumber: z.string().optional(),
  province: z.string().optional(),
  businessName: z.string().optional(),
  organization: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const caller = await getAuthenticatedUser(req, true);
    if (!caller || caller.role !== 'admin') {
      throw new AuthorizationError('Administrative privileges required');
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const result = await userRepository.findUsers({
      search,
      role,
      status,
      page,
      limit,
    });

    return jsonResponse(result, requestId, 200);
  } catch (err) {
    return errorResponse(err, requestId);
  }
}

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();

  try {
    const caller = await getAuthenticatedUser(req, true);
    if (!caller || caller.role !== 'admin') {
      throw new AuthorizationError('Administrative privileges required to provision user accounts');
    }

    const data = await parseAndValidateBody(req, createUserSchema);

    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError(`A user with email ${data.email} already exists`);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const accountType = data.role === 'customer' ? 'personal' : 'business';

    const newUser = new User({
      id: randomUUID(),
      accountType,
      role: data.role as any,
      fullName: data.fullName,
      email: Email.create(data.email),
      passwordHash: PasswordHash.create(passwordHash),
      phoneNumber: data.phoneNumber,
      province: data.province,
      businessName: data.businessName || data.organization,
      accountStatus: AccountStatus.ACTIVE,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = await userRepository.create(newUser);

    return jsonResponse(
      {
        user: {
          id: created.id,
          fullName: created.fullName,
          email: created.email.getValue(),
          role: created.role,
          accountType: created.accountType,
          status: created.accountStatus,
          isVerified: created.isVerified,
          phoneNumber: created.phoneNumber,
          province: created.province,
          businessName: created.businessName,
          createdAt: created.createdAt,
        },
        message: `${data.role === 'admin' ? 'Administrator' : 'User'} created successfully`,
      },
      requestId,
      201
    );
  } catch (err) {
    return errorResponse(err, requestId);
  }
}
