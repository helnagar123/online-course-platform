import { jest } from '@jest/globals';

const mockUser = {
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
};

jest.unstable_mockModule(
  '../../../src/models/User.js',
  () => ({
    default: mockUser,
  })
);

const {
  getUserById,
  findUserByEmail,
  updateProfile,
  getUsers,
  updateUserByAdmin,
  deactivateUser,
} = await import(
  '../../../src/services/user.service.js'
);

describe('User Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return the user', async () => {
      const user = {
        _id: 'user-1',
        firstName: 'Hassan',
      };

      mockUser.findById.mockResolvedValue(
        user
      );

      const result =
        await getUserById('user-1');

      expect(
        mockUser.findById
      ).toHaveBeenCalledWith(
        'user-1'
      );

      expect(result).toBe(user);
    });

    it('should throw when user does not exist', async () => {
      mockUser.findById.mockResolvedValue(null);

      await expect(
        getUserById('missing-user')
      ).rejects.toMatchObject({
        message: 'User not found',
        statusCode: 404,
      });
    });
  });

  describe('findUserByEmail', () => {
    it('should find a user by email', async () => {
      const user = {
        _id: 'user-1',
        email: 'test@example.com',
      };

      mockUser.findOne.mockResolvedValue(
        user
      );

      const result =
        await findUserByEmail(
          'test@example.com'
        );

      expect(
        mockUser.findOne
      ).toHaveBeenCalledWith({
        email: 'test@example.com',
      });

      expect(result).toBe(user);
    });

    it('should select password when requested', async () => {
      const user = {
        _id: 'user-1',
        email: 'test@example.com',
        password: 'hashed',
      };

      const query = {
        select: jest.fn().mockResolvedValue(
          user
        ),
      };

      mockUser.findOne.mockReturnValue(
        query
      );

      const result =
        await findUserByEmail(
          'test@example.com',
          {
            includePassword: true,
          }
        );

      expect(
        query.select
      ).toHaveBeenCalledWith('+password');

      expect(result).toBe(user);
    });
  });

  describe('updateProfile', () => {
    it('should update allowed profile fields', async () => {
      const user = {
        _id: 'user-1',
        firstName: 'Hassan',
        lastName: 'Elnagar',
      };

      mockUser.findByIdAndUpdate.mockResolvedValue(
        user
      );

      const result =
        await updateProfile(
          'user-1',
          {
            firstName: 'Ahmed',
            lastName: 'Ali',
            role: 'admin',
          }
        );

      expect(
        mockUser.findByIdAndUpdate
      ).toHaveBeenCalledWith(
        'user-1',
        {
          firstName: 'Ahmed',
          lastName: 'Ali',
        },
        {
          new: true,
          runValidators: true,
        }
      );

      expect(result).toBe(user);
    });

    it('should reject empty valid updates', async () => {
      await expect(
        updateProfile('user-1', {
          role: 'admin',
        })
      ).rejects.toMatchObject({
        message:
          'No valid profile fields were provided',
        statusCode: 400,
      });

      expect(
        mockUser.findByIdAndUpdate
      ).not.toHaveBeenCalled();
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const users = [
        {
          _id: 'user-1',
        },
      ];

      const query = {
        sort: jest.fn(),
        skip: jest.fn(),
        limit: jest.fn(),
      };

      query.sort.mockReturnValue(query);
      query.skip.mockReturnValue(query);
      query.limit.mockResolvedValue(users);

      mockUser.find.mockReturnValue(query);

      mockUser.countDocuments.mockResolvedValue(
        15
      );

      const result = await getUsers({
        role: 'student',
        page: 2,
        limit: 10,
        sortBy: 'firstName',
        sortOrder: 'asc',
      });

      expect(
        mockUser.find
      ).toHaveBeenCalledWith({
        role: 'student',
      });

      expect(
        query.sort
      ).toHaveBeenCalledWith({
        firstName: 1,
      });

      expect(
        query.skip
      ).toHaveBeenCalledWith(10);

      expect(
        query.limit
      ).toHaveBeenCalledWith(10);

      expect(result).toEqual({
        users,
        pagination: {
          page: 2,
          limit: 10,
          totalUsers: 15,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      });
    });
  });

  describe('updateUserByAdmin', () => {
    it('should update admin-controlled fields', async () => {
      const user = {
        _id: 'user-1',
        role: 'instructor',
        isActive: true,
      };

      mockUser.findByIdAndUpdate.mockResolvedValue(
        user
      );

      const result =
        await updateUserByAdmin(
          'user-1',
          {
            role: 'instructor',
            isActive: false,
            firstName: 'Ignored',
          }
        );

      expect(
        mockUser.findByIdAndUpdate
      ).toHaveBeenCalledWith(
        'user-1',
        {
          role: 'instructor',
          isActive: false,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      expect(result).toBe(user);
    });

    it('should reject invalid update fields', async () => {
      await expect(
        updateUserByAdmin(
          'user-1',
          {
            firstName: 'Ignored',
          }
        )
      ).rejects.toMatchObject({
        message:
          'No valid user fields were provided',
        statusCode: 400,
      });
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate an existing user', async () => {
      const user = {
        _id: 'user-1',
        isActive: false,
      };

      mockUser.findByIdAndUpdate.mockResolvedValue(
        user
      );

      const result =
        await deactivateUser(
          'user-1'
        );

      expect(
        mockUser.findByIdAndUpdate
      ).toHaveBeenCalledWith(
        'user-1',
        {
          isActive: false,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      expect(result).toBe(user);
    });
  });
});