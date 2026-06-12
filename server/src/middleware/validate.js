const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error('Zod Error:', JSON.stringify(err.errors, null, 2));
      return res.status(400).json({
        error: 'Validation Error',
        details: err.errors
      });
    }
    next(err);
  }
};

module.exports = validate;
