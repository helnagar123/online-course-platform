import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true
    },

    revokedAt: {
      type: Date,
      default: null
    },

    replacedByTokenHash: {
      type: String,
      default: null
    },

    userAgent: {
      type: String,
      default: null
    },

    ipAddress: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const RefreshToken = mongoose.model(
  'RefreshToken',
  refreshTokenSchema
);

export default RefreshToken;