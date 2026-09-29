import User from '../models/User.js';
import AppError from '../utils/AppError.js';

const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

const findUserByEmail = async (email, { includePassword = false } = {}) => {
  let query = User.findOne({ email });

  if (includePassword) {
    query = query.select('+password');
  }

  return query;
};

const updateProfile = async (userId, updateData) => {
  const allowedFields = [
    'firstName',
    'lastName',
    'avatar'
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError(
      'No valid profile fields were provided',
      400
    );
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updates,
    {
      new: true,
      runValidators: true
    }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

const getUsers = async ({
  search = '',
  role,
  isActive,
  page = 1,
  limit = 10,
  sortBy = 'createdAt',
  sortOrder = 'desc'
} = {}) => {
  const query = {};

  if (role) {
    query.role = role;
  }

  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  if (search) {
    query.$or = [
      {
        firstName: {
          $regex: search,
          $options: 'i'
        }
      },
      {
        lastName: {
          $regex: search,
          $options: 'i'
        }
      },
      {
        email: {
          $regex: search,
          $options: 'i'
        }
      }
    ];
  }

  const skip = (page - 1) * limit;

  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const allowedSortFields = [
    'createdAt',
    'firstName',
    'lastName',
    'email'
  ];

  const safeSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : 'createdAt';

  const [users, totalUsers] = await Promise.all([
    User.find(query)
      .sort({ [safeSortBy]: sortDirection })
      .skip(skip)
      .limit(limit),

    User.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalUsers / limit);

  return {
    users,
    pagination: {
      page,
      limit,
      totalUsers,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
};

const updateUserByAdmin = async (userId, updateData) => {
  const allowedFields = [
    'role',
    'isActive'
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError(
      'No valid user fields were provided',
      400
    );
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updates,
    {
      new: true,
      runValidators: true
    }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

const deactivateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      isActive: false
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

export {
  getUserById,
  findUserByEmail,
  updateProfile,
  getUsers,
  updateUserByAdmin,
  deactivateUser
};