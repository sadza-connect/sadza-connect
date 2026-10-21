import { NextRequest } from 'next/server';
import { JwtService } from '../../application/auth/jwt-service.js';
import { UserRepository } from '../../infrastructure/database/repositories/user-repository.js';
import { AuthenticationError } from '../errors/AppError.js';
import type { User } from '../../domain/index.js';

const jwtService = new JwtService();
const userRepo = new UserRepository();

export async function getAuthenticatedUser(
  req: NextRequest,
  required = true
): Promise<User | null> {
  let token = '';
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    token = req.cookies.get('sadza_access_token')?.value || '';
  }

  if (!token) {
    if (required) {
      throw new AuthenticationError('Authentication required');
    }
    return null;
  }

  try {
    const payload = jwtService.verifyAccessToken(token);
    const user = await userRepo.findById(payload.sub);
    if (!user) {
      if (required) {
        throw new AuthenticationError('User account not found');
      }
      return null;
    }
    return user;
  } catch (err) {
    if (required) {
      throw new AuthenticationError('Invalid or expired authentication session');
    }
    return null;
  }
}
