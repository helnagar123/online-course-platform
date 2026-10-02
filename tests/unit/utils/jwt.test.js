import jwt from 'jsonwebtoken';

import {
  generateAccessToken,
  verifyAccessToken,
} from '../../../src/utils/jwt.js';

describe('JWT Utils', () => {
  const user = {
    _id: '68c123456789abcdef123456',
    role: 'student',
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(user);

      expect(token).toEqual(expect.any(String));
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate a token with the correct payload', () => {
      const token = generateAccessToken(user);

      const decoded = jwt.decode(token);

      expect(decoded).toMatchObject({
        sub: user._id,
        role: user.role,
        type: 'access',
      });
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(user);

      const decoded = verifyAccessToken(token);

      expect(decoded).toMatchObject({
        sub: user._id,
        role: user.role,
        type: 'access',
      });
    });

    it('should reject an invalid token', () => {
      expect(() => {
        verifyAccessToken('invalid-token');
      }).toThrow();
    });
  });
});