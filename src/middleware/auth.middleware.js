import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/jwt.js';

const extractBearerToken = (req) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
        throw new AppError(
            'Authentication required',
            401
        );
    }

    const [scheme, token] = authorization.split(' ');

    if (
        scheme !== 'Bearer' ||
        !token
    ) {
        throw new AppError(
            'Invalid authorization header format',
            401
        );
    }

    return token;
};

const authenticate = async (
    req,
    res,
    next
) => {
    try {
        const token = extractBearerToken(req);

        let payload;

        try {
            payload = verifyAccessToken(token);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return next(
                    new AppError(
                        'Access token has expired',
                        401
                    )
                );
            }

            if (
                error.name === 'JsonWebTokenError' ||
                error.name === 'NotBeforeError'
            ) {
                return next(
                    new AppError(
                        'Invalid access token',
                        401
                    )
                );
            }

            return next(error);
        }

        if (
            !payload ||
            payload.type !== 'access' ||
            !payload.sub
        ) {
            return next(
                new AppError(
                    'Invalid access token',
                    401
                )
            );
        }

        const user = await User.findById(
            payload.sub
        ).select(
            '_id firstName lastName email role avatar isActive createdAt updatedAt'
        );

        if (!user) {
            return next(
                new AppError(
                    'User no longer exists',
                    401
                )
            );
        }

        if (!user.isActive) {
            return next(
                new AppError(
                    'Your account is inactive',
                    403
                )
            );
        }

        req.user = user;

        next();
    } catch (error) {
        next(error);
    }
};

export default authenticate;