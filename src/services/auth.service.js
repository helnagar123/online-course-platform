import crypto from 'crypto';

import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import AppError from '../utils/AppError.js';
import {
  hashPassword,
  comparePassword
} from '../utils/password.js';
import {
  generateAccessToken
} from '../utils/jwt.js';

const REFRESH_TOKEN_BYTES = 64;

const hashRefreshToken = (token) => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

const generateRefreshToken = () => {
  return crypto
    .randomBytes(REFRESH_TOKEN_BYTES)
    .toString('hex');
};

const sanitizeUser = (user) => {
  const userObject = user.toObject
    ? user.toObject()
    : { ...user };

  delete userObject.password;

  return userObject;
};

const createRefreshTokenRecord = async (
  userId,
  meta = {}
) => {
  const rawRefreshToken =
    generateRefreshToken();

  const tokenHash =
    hashRefreshToken(rawRefreshToken);

  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  await RefreshToken.create({
    user: userId,
    tokenHash,
    expiresAt,
    userAgent: meta.userAgent || null,
    ipAddress: meta.ipAddress || null
  });

  return {
    rawRefreshToken,
    tokenHash
  };
};

const issueTokens = async (
  user,
  meta = {}
) => {
  const accessToken =
    generateAccessToken(user);

  const {
    rawRefreshToken,
    tokenHash
  } = await createRefreshTokenRecord(
    user._id,
    meta
  );

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    refreshTokenHash: tokenHash
  };
};

const registerUser = async (
  userData,
  meta = {}
) => {
  const existingUser =
    await User.findOne({
      email: userData.email
    });

  if (existingUser) {
    throw new AppError(
      'Email is already registered',
      409
    );
  }

  const hashedPassword =
    await hashPassword(
      userData.password
    );

  const user = await User.create({
    ...userData,
    password: hashedPassword
  });

  const tokens = await issueTokens(
    user,
    meta
  );

  return {
    user: sanitizeUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };
};

const loginUser = async (
  email,
  password,
  meta = {}
) => {
  const user =
    await User.findOne({
      email
    }).select('+password');

  if (!user) {
    throw new AppError(
      'Invalid email or password',
      401
    );
  }

  const passwordMatches =
    await comparePassword(
      password,
      user.password
    );

  if (!passwordMatches) {
    throw new AppError(
      'Invalid email or password',
      401
    );
  }

  if (!user.isActive) {
    throw new AppError(
      'Your account is inactive',
      403
    );
  }

  const tokens = await issueTokens(
    user,
    meta
  );

  return {
    user: sanitizeUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };
};

const refreshAccessToken = async (
  rawRefreshToken
) => {
  const tokenHash =
    hashRefreshToken(
      rawRefreshToken
    );

  const storedToken =
    await RefreshToken.findOne({
      tokenHash,
      revokedAt: null
    }).populate('user');

  if (!storedToken) {
    throw new AppError(
      'Invalid refresh token',
      401
    );
  }

  if (
    storedToken.expiresAt <= new Date()
  ) {
    storedToken.revokedAt = new Date();
    await storedToken.save();

    throw new AppError(
      'Refresh token has expired',
      401
    );
  }

  if (!storedToken.user.isActive) {
    throw new AppError(
      'User account is inactive',
      403
    );
  }

  const accessToken =
    generateAccessToken(
      storedToken.user
    );

  const newRawRefreshToken =
    generateRefreshToken();

  const newTokenHash =
    hashRefreshToken(
      newRawRefreshToken
    );

  const newRefreshToken =
    await RefreshToken.create({
      user: storedToken.user._id,
      tokenHash: newTokenHash,
      expiresAt: new Date(
        Date.now() +
          7 * 24 * 60 * 60 * 1000
      )
    });

  storedToken.revokedAt = new Date();
  storedToken.replacedByTokenHash =
    newTokenHash;

  await storedToken.save();

  return {
    accessToken,
    refreshToken: newRawRefreshToken,
    refreshTokenId: newRefreshToken._id
  };
};

const logoutUser = async (
  rawRefreshToken
) => {
  const tokenHash =
    hashRefreshToken(
      rawRefreshToken
    );

  const storedToken =
    await RefreshToken.findOne({
      tokenHash,
      revokedAt: null
    });

  if (!storedToken) {
    return;
  }

  storedToken.revokedAt =
    new Date();

  await storedToken.save();
};

const logoutAllSessions = async (
  userId
) => {
  await RefreshToken.updateMany(
    {
      user: userId,
      revokedAt: null
    },
    {
      revokedAt: new Date()
    }
  );
};

const getCurrentUser = async (
  userId
) => {
  const user =
    await User.findById(userId);

  if (!user) {
    throw new AppError(
      'User not found',
      404
    );
  }

  if (!user.isActive) {
    throw new AppError(
      'Your account is inactive',
      403
    );
  }

  return user;
};

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllSessions,
  getCurrentUser
};