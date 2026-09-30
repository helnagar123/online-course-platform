import AppError from '../utils/AppError.js';

const authorizeOwnership = (
  paramName = 'userId'
) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError(
          'Authentication required',
          401
        )
      );
    }

    const resourceUserId =
      req.params[paramName];

    if (!resourceUserId) {
      return next(
        new AppError(
          `Missing route parameter: ${paramName}`,
          400
        )
      );
    }

    if (
      req.user.id !== resourceUserId
    ) {
      return next(
        new AppError(
          'You are not allowed to access this resource',
          403
        )
      );
    }

    next();
  };
};

export default authorizeOwnership;