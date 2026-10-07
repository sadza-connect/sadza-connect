import { ValidationError } from '../../shared/errors/index.js';

export class PasswordHash {
  private constructor(private readonly value: string) {}

  static create(hash: string): PasswordHash {
    if (!hash || typeof hash !== 'string') {
      throw new ValidationError('Password hash is required');
    }
    if (hash.length < 20) {
      throw new ValidationError('Invalid password hash');
    }
    return new PasswordHash(hash);
  }

  getValue(): string {
    return this.value;
  }
}
