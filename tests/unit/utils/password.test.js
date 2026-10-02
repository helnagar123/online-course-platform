import {
  hashPassword,
  comparePassword,
} from '../../../src/utils/password.js';

describe('Password Utils', () => {
  const plainPassword = 'StrongPassword123!';
  
  it('should hash a password', async () => {
    const hashedPassword =
      await hashPassword(plainPassword);

    expect(hashedPassword).toEqual(
      expect.any(String)
    );

    expect(hashedPassword).not.toBe(
      plainPassword
    );
  });

  it('should return true when password matches the hash', async () => {
    const hashedPassword =
      await hashPassword(plainPassword);

    const result = await comparePassword(
      plainPassword,
      hashedPassword
    );

    expect(result).toBe(true);
  });

  it('should return false when password does not match the hash', async () => {
    const hashedPassword =
      await hashPassword(plainPassword);

    const result = await comparePassword(
      'WrongPassword123!',
      hashedPassword
    );

    expect(result).toBe(false);
  });
});