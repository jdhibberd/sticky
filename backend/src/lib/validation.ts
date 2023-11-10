// QUIRK: the default import isn't working as documented
// https://github.com/ajv-validator/ajv/issues/2132
import ajvModule, { JSONSchemaType, ValidateFunction } from "ajv";
import { RequestHandler } from "express";

const Ajv = ajvModule.default;
const ajv = new Ajv({ allErrors: true });

/**
 * Helper function for compiling a validation schema, that abstracts away the
 * underlying package being used.
 */
export function compile<T>(schema: JSONSchemaType<T>) {
  return ajv.compile<T>(schema);
}

/**
 *
 * Express request handler for validating the request body against a compiled
 * validation schema.
 */
export function handler(validate: ValidateFunction): RequestHandler {
  return async (req, res, next) => {
    const valid = validate(req.body);
    if (!valid) {
      res.status(400);
      res.json(validate.errors);
    } else {
      next();
    }
  };
}
