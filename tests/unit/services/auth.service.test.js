import { jest } from '@jest/globals';

const mockUser = {
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
};

const mockRefreshToken = {
  create: jest.fn(),
  findOne: jest.fn(),
  updateMany: jest.fn(),
};

const mockPassword = {
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
};

const mockJwt = {
  generateAccessToken: jest.fn(),
};

const mockEnv = {
  jwt: {
    refreshExpiresIn: '7d',
  },
};

const mockParseDuration =
  jest.fn().mockReturnValue(
    7 * 24 * 60 * 60 * 1000
  );

jest.unstable_mockModule(
  '../../../src/models/User.js',
  () => ({
    default: mockUser,
  })
);

jest.unstable_mockModule(
  '../../../src/models/RefreshToken.js',
  () => ({
    default: mockRefreshToken,
  })
);

jest.unstable_mockModule(
  '../../../src/utils/password.js',
  () => ({
    ...mockPassword,
  })
);

jest.unstable_mockModule(
  '../../../src/utils/jwt.js',
  () => ({
    ...mockJwt,
  })
);

jest.unstable_mockModule(
  '../../../src/config/env.js',
  () => ({
    default: mockEnv,
  })
);

jest.unstable_mockModule(
  '../../../src/utils/time.js',
  () => ({
    default: mockParseDuration,
  })
);

const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllSessions,
  getCurrentUser,
} = await import(
  '../../../src/services/auth.service.js'
);

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockPassword.hashPassword.mockResolvedValue(
      'hashed-password'
    );

    mockPassword.comparePassword.mockResolvedValue(
      true
    );

    mockJwt.generateAccessToken.mockReturnValue(
      'access-token'
    );

    mockRefreshToken.create.mockResolvedValue({
      _id: 'refresh-token-id',
    });
  });

  describe('registerUser', () => {
    it('should reject an already registered email', async () => {
      mockUser.findOne.mockResolvedValue({
        _id: 'existing-user',
        email: 'test@example.com',
      });

      await expect(
        registerUser({
          firstName: 'Hassan',
          lastName: 'Elnagar',
          email: 'test@example.com',
          password: 'Password123!',
        })
      ).rejects.toMatchObject({
        message: 'Email is already registered',
        statusCode: 409,
      });

      expect(
        mockPassword.hashPassword
      ).not.toHaveBeenCalled();

      expect(
        mockUser.create
      ).not.toHaveBeenCalled();
    });

    it('should create a user with a hashed password', async () => {
      mockUser.findOne.mockResolvedValue(
        null
      );

      const user = {
        _id: 'user-1',
        firstName: 'Hassan',
        lastName: 'Elnagar',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'student',

        toObject: () => ({
          _id: 'user-1',
          firstName: 'Hassan',
          lastName: 'Elnagar',
          email: 'test@example.com',
          password: 'hashed-password',
          role: 'student',
        }),
      };

      mockUser.create.mockResolvedValue(
        user
      );

      const result = await registerUser({
        firstName: 'Hassan',
        lastName: 'Elnagar',
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(
        mockPassword.hashPassword
      ).toHaveBeenCalledWith(
        'Password123!'
      );

      expect(
        mockUser.create
      ).toHaveBeenCalledWith({
        firstName: 'Hassan',
        lastName: 'Elnagar',
        email: 'test@example.com',
        password: 'hashed-password',
      });

      expect(
        mockJwt.generateAccessToken
      ).toHaveBeenCalledWith(user);

      expect(
        mockRefreshToken.create
      ).toHaveBeenCalled();

      expect(result.user).not.toHaveProperty(
        'password'
      );

      expect(result.accessToken).toBe(
        'access-token'
      );

      expect(result.refreshToken).toEqual(
        expect.any(String)
      );
    });
  });

  describe('loginUser', () => {
    it('should reject an unknown email', async () => {
      mockUser.findOne.mockReturnValue({
        select: jest
          .fn()
          .mockResolvedValue(null),
      });

      await expect(
        loginUser(
          'missing@example.com',
          'Password123!'
        )
      ).rejects.toMatchObject({
        message: 'Invalid email or password',
        statusCode: 401,
      });

      expect(
        mockPassword.comparePassword
      ).not.toHaveBeenCalled();
    });

    it('should reject an incorrect password', async () => {
      const user = {
        _id: 'user-1',
        password: 'hashed-password',
      };

      mockUser.findOne.mockReturnValue({
        select: jest
          .fn()
          .mockResolvedValue(user),
      });

      mockPassword.comparePassword.mockResolvedValue(
        false
      );

      await expect(
        loginUser(
          'test@example.com',
          'WrongPassword!'
        )
      ).rejects.toMatchObject({
        message: 'Invalid email or password',
        statusCode: 401,
      });

      expect(
        mockJwt.generateAccessToken
      ).not.toHaveBeenCalled();
    });

    it('should reject an inactive user', async () => {
      const user = {
        _id: 'user-1',
        password: 'hashed-password',
        isActive: false,
      };

      mockUser.findOne.mockReturnValue({
        select: jest
          .fn()
          .mockResolvedValue(user),
      });

      await expect(
        loginUser(
          'test@example.com',
          'Password123!'
        )
      ).rejects.toMatchObject({
        message: 'Your account is inactive',
        statusCode: 403,
      });
    });

    it('should login an active user successfully', async () => {
      const user = {
        _id: 'user-1',
        password: 'hashed-password',
        isActive: true,

        toObject: () => ({
          _id: 'user-1',
          email: 'test@example.com',
          password: 'hashed-password',
          isActive: true,
        }),
      };

      const select = jest
        .fn()
        .mockResolvedValue(user);

      mockUser.findOne.mockReturnValue({
        select,
      });

      const result = await loginUser(
        'test@example.com',
        'Password123!',
        {
          userAgent: 'Jest',
          ipAddress: '127.0.0.1',
        }
      );

      expect(
        mockUser.findOne
      ).toHaveBeenCalledWith({
        email: 'test@example.com',
      });

      expect(select).toHaveBeenCalledWith(
        '+password'
      );

      expect(
        mockPassword.comparePassword
      ).toHaveBeenCalledWith(
        'Password123!',
        'hashed-password'
      );

      expect(result.accessToken).toBe(
        'access-token'
      );

      expect(result.refreshToken).toEqual(
        expect.any(String)
      );

      expect(result.user).not.toHaveProperty(
        'password'
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should reject an invalid refresh token', async () => {
      mockRefreshToken.findOne.mockReturnValue({
        populate: jest
          .fn()
          .mockResolvedValue(null),
      });

      await expect(
        refreshAccessToken(
          'invalid-refresh-token'
        )
      ).rejects.toMatchObject({
        message: 'Invalid refresh token',
        statusCode: 401,
      });
    });

    it('should revoke an expired refresh token', async () => {
      const storedToken = {
        expiresAt: new Date(
          Date.now() - 1000
        ),
        save: jest
          .fn()
          .mockResolvedValue(),
        user: {
          _id: 'user-1',
          isActive: true,
        },
      };

      mockRefreshToken.findOne.mockReturnValue({
        populate: jest
          .fn()
          .mockResolvedValue(
            storedToken
          ),
      });

      await expect(
        refreshAccessToken(
          'expired-token'
        )
      ).rejects.toMatchObject({
        message:
          'Refresh token has expired',
        statusCode: 401,
      });

      expect(
        storedToken.revokedAt
      ).toEqual(expect.any(Date));

      expect(
        storedToken.save
      ).toHaveBeenCalled();
    });

    it('should reject refresh for an inactive user', async () => {
      const storedToken = {
        expiresAt: new Date(
          Date.now() + 60_000
        ),
        user: {
          _id: 'user-1',
          isActive: false,
        },
      };

      mockRefreshToken.findOne.mockReturnValue({
        populate: jest
          .fn()
          .mockResolvedValue(
            storedToken
          ),
      });

      await expect(
        refreshAccessToken(
          'refresh-token'
        )
      ).rejects.toMatchObject({
        message:
          'User account is inactive',
        statusCode: 403,
      });
    });

    it('should rotate a valid refresh token', async () => {
      const storedToken = {
        expiresAt: new Date(
          Date.now() + 60_000
        ),
        userAgent: 'Jest',
        ipAddress: '127.0.0.1',
        user: {
          _id: 'user-1',
          isActive: true,
        },
        save: jest
          .fn()
          .mockResolvedValue(),
      };

      mockRefreshToken.findOne.mockReturnValue({
        populate: jest
          .fn()
          .mockResolvedValue(
            storedToken
          ),
      });

      const result =
        await refreshAccessToken(
          'old-refresh-token'
        );

      expect(
        mockJwt.generateAccessToken
      ).toHaveBeenCalledWith(
        storedToken.user
      );

      expect(
        mockRefreshToken.create
      ).toHaveBeenCalled();

      expect(
        storedToken.revokedAt
      ).toEqual(expect.any(Date));

      expect(
        storedToken.replacedByTokenHash
      ).toEqual(expect.any(String));

      expect(
        storedToken.save
      ).toHaveBeenCalled();

      expect(result).toMatchObject({
        accessToken: 'access-token',
        refreshToken: expect.any(String),
        refreshTokenId: 'refresh-token-id',
      });
    });
  });

  describe('logoutUser', () => {
    it('should revoke the refresh token', async () => {
      const storedToken = {
        revokedAt: null,
        save: jest
          .fn()
          .mockResolvedValue(),
      };

      mockRefreshToken.findOne.mockResolvedValue(
        storedToken
      );

      await logoutUser(
        'refresh-token'
      );

      expect(
        storedToken.revokedAt
      ).toEqual(expect.any(Date));

      expect(
        storedToken.save
      ).toHaveBeenCalled();
    });

    it('should do nothing when token does not exist', async () => {
      mockRefreshToken.findOne.mockResolvedValue(
        null
      );

      await expect(
        logoutUser('missing-token')
      ).resolves.toBeUndefined();
    });
  });

  describe('logoutAllSessions', () => {
    it('should revoke all active sessions', async () => {
      mockRefreshToken.updateMany.mockResolvedValue(
        {
          acknowledged: true,
          modifiedCount: 2,
        }
      );

      await logoutAllSessions(
        'user-1'
      );

      expect(
        mockRefreshToken.updateMany
      ).toHaveBeenCalledWith(
        {
          user: 'user-1',
          revokedAt: null,
        },
        {
          revokedAt: expect.any(Date),
        }
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return an active user', async () => {
      const user = {
        _id: 'user-1',
        isActive: true,
      };

      mockUser.findById.mockResolvedValue(
        user
      );

      const result =
        await getCurrentUser(
          'user-1'
        );

      expect(
        mockUser.findById
      ).toHaveBeenCalledWith(
        'user-1'
      );

      expect(result).toBe(user);
    });

    it('should reject a missing user', async () => {
      mockUser.findById.mockResolvedValue(
        null
      );

      await expect(
        getCurrentUser('missing-user')
      ).rejects.toMatchObject({
        message: 'User not found',
        statusCode: 404,
      });
    });

    it('should reject an inactive user', async () => {
      mockUser.findById.mockResolvedValue({
        _id: 'user-1',
        isActive: false,
      });

      await expect(
        getCurrentUser('user-1')
      ).rejects.toMatchObject({
        message:
          'Your account is inactive',
        statusCode: 403,
      });
    });
  });
});