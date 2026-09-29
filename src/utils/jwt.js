import jwt from 'jsonwebtoken';
import env from '../config/env.js';

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      type: 'access'
    },
    env.jwt.accessSecret,
    {
      expiresIn: env.jwt.accessExpiresIn
    }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(
    token,
    env.jwt.accessSecret
  );
};

export {
  generateAccessToken,
  verifyAccessToken
};