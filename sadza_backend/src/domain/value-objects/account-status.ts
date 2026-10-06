export enum AccountStatus {
  PENDING_VERIFICATION = 'pending_verification',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

export function accountStatusFromString(value: string): AccountStatus {
  const normalized = value.toLowerCase();
  switch (normalized) {
    case 'active':
      return AccountStatus.ACTIVE;
    case 'suspended':
      return AccountStatus.SUSPENDED;
    case 'deleted':
      return AccountStatus.DELETED;
    case 'pending_verification':
    default:
      return AccountStatus.PENDING_VERIFICATION;
  }
}
