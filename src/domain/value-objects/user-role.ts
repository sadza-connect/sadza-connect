export enum UserRole {
  CUSTOMER = 'customer',
  MERCHANT = 'merchant',
  ADMIN = 'admin',
}

export function userRoleFromString(value: string): UserRole {
  const normalized = value.toLowerCase();
  switch (normalized) {
    case 'merchant':
    case 'business':
      return UserRole.MERCHANT;
    case 'admin':
    case 'superadmin':
      return UserRole.ADMIN;
    case 'customer':
    case 'personal':
    case 'user':
    default:
      return UserRole.CUSTOMER;
  }
}
