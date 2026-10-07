import assert from 'node:assert';
import {
  Email,
  PasswordHash,
  UserRole,
  User,
} from '../src/domain/index.js';
import { JwtService } from '../src/application/auth/jwt-service.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
} from '../src/shared/validators/auth-validators.js';

console.log('🧪 Starting Sadza Connect Unified Authentication Unit & Smoke Tests...\n');

// ─── 1. Test Domain Value Objects ──────────────────────────────────────────
console.log('1. Testing Value Objects...');
const validEmail = Email.create('tendai@sadzaconnect.co.zw');
assert.strictEqual(validEmail.getValue(), 'tendai@sadzaconnect.co.zw');

assert.throws(() => Email.create('invalid-email'), /Invalid email format/);
assert.throws(() => Email.create(''), /Email is required/);

const hash = PasswordHash.create('$2b$12$abcdefghijklmnopqrstuv1234567890');
assert.strictEqual(hash.getValue(), '$2b$12$abcdefghijklmnopqrstuv1234567890');
assert.throws(() => PasswordHash.create('short'), /Invalid password hash/);
console.log('   ✅ Value Objects validated');

// ─── 2. Test User Entity ──────────────────────────────────────────────────
console.log('2. Testing User Entity...');
const user = User.create({
  id: '00000000-0000-0000-0000-000000000001',
  accountType: 'business',
  role: UserRole.MERCHANT,
  fullName: 'Kudzai Moyo',
  email: validEmail,
  passwordHash: hash,
  phoneNumber: '+263773456789',
  province: 'Midlands Province',
  businessName: 'Midlands Solar & Agro Solutions',
  sector: 'Solar & Renewable Energy',
  businessStructure: 'corporate',
});

assert.strictEqual(user.fullName, 'Kudzai Moyo');
assert.strictEqual(user.role, UserRole.MERCHANT);
assert.strictEqual(user.accountType, 'business');
assert.strictEqual(user.isVerified, false);
assert.strictEqual(user.canLogin(), true);

const verifiedUser = user.markVerified();
assert.strictEqual(verifiedUser.isVerified, true);
console.log('   ✅ User Entity behavior verified');

// ─── 3. Test JWT Service ──────────────────────────────────────────────────
console.log('3. Testing JWT Service...');
const jwtService = new JwtService();

// Access token
const accessToken = jwtService.generateAccessToken({
  userId: user.id,
  role: user.role,
  email: user.email.getValue(),
  accountType: user.accountType,
});
const accessPayload = jwtService.verifyAccessToken(accessToken);
assert.strictEqual(accessPayload.sub, user.id);
assert.strictEqual(accessPayload.role, UserRole.MERCHANT);
assert.strictEqual(accessPayload.email, 'tendai@sadzaconnect.co.zw');
assert.strictEqual(accessPayload.accountType, 'business');

// Refresh token
const { token: refreshToken, jti } = jwtService.generateRefreshToken(user.id);
const refreshPayload = jwtService.verifyRefreshToken(refreshToken);
assert.strictEqual(refreshPayload.sub, user.id);
assert.strictEqual(refreshPayload.jti, jti);

// Token hashing
const hash1 = jwtService.hashToken(refreshToken);
const hash2 = jwtService.hashToken(refreshToken);
assert.strictEqual(hash1, hash2);
assert.strictEqual(hash1.length, 64); // SHA-256 in hex

// Reset token
const resetToken = jwtService.generatePasswordResetToken(user.id);
const resetPayload = jwtService.verifyPasswordResetToken(resetToken);
assert.strictEqual(resetPayload.sub, user.id);
console.log('   ✅ JWT Service generation, verification, and rotation tokens verified');

// ─── 4. Test Request Validators ───────────────────────────────────────────
console.log('4. Testing Request Validators...');

// Register Personal
const validPersonal = registerSchema.safeParse({
  accountType: 'personal',
  fullName: 'Tinashe Sibanda',
  email: 'tinashe.sibanda@gmail.com',
  password: 'Password123!',
  phoneNumber: '+263 71 890 1234',
  province: 'Bulawayo Province',
});
assert.strictEqual(validPersonal.success, true);

// Register Business
const validBusiness = registerSchema.safeParse({
  accountType: 'business',
  fullName: 'Kudzai Moyo',
  businessName: 'Midlands Solar & Agro',
  sector: 'Solar & Renewable Energy',
  businessStructure: 'corporate',
  email: 'kudzai@midlandssolar.co.zw',
  password: 'Password123!',
  phoneNumber: '077 345 6789',
  province: 'Midlands Province',
});
assert.strictEqual(validBusiness.success, true);

// Login with email
const loginByEmail = loginSchema.safeParse({
  email: 'tendai@sadzaconnect.co.zw',
  password: 'Password123!',
});
assert.strictEqual(loginByEmail.success, true);

// Login with phone number identifier
const loginByPhone = loginSchema.safeParse({
  identifier: '+263772459811',
  password: 'Password123!',
});
assert.strictEqual(loginByPhone.success, true);

// OTP Verification
const validOtp = verifyEmailSchema.safeParse({ token: '123456' });
assert.strictEqual(validOtp.success, true);
const invalidOtp = verifyEmailSchema.safeParse({ token: '123' });
assert.strictEqual(invalidOtp.success, false);

const validResetOtp = verifyResetOtpSchema.safeParse({
  email: 'test@example.com',
  otp: '987654',
});
assert.strictEqual(validResetOtp.success, true);

const validResetPw = resetPasswordSchema.safeParse({
  resetToken: 'jwt-reset-token-here',
  password: 'NewStrongPassword2026!',
});
assert.strictEqual(validResetPw.success, true);
console.log('   ✅ Zod input validation schemas verified');

console.log('\n🎉 ALL UNIFIED AUTHENTICATION UNIT & SMOKE TESTS PASSED SUCCESSFULLY!\n');
