import AppError from '../utils/AppError.js';

const validationOptions = {
  abortEarly: false,
  allowUnknown: false,
  stripUnknown: true,
  convert: true
};

const validate = (schemas) => {
  return (req, res, next) => {
    const validationErrors = {};

    for (
      const [source, schema]
      of Object.entries(schemas)
    ) {
      const result = schema.validate(
        req[source],
        validationOptions
      );

      if (result.error) {
        validationErrors[source] =
          result.error.details.map(
            (detail) => ({
              field:
                detail.path.join('.'),

              message:
                detail.message
            })
          );

        continue;
      }

      req[source] = result.value;
    }

    if (
      Object.keys(
        validationErrors
      ).length > 0
    ) {
      return next(
        new AppError(
          'Validation failed',
          400,
          validationErrors
        )
      );
    }

    next();
  };
};

export default validate;