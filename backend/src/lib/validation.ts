import Ajv, { JSONSchemaType, KeywordDefinition, ValidateFunction } from "ajv";
import formatsPlugin from "ajv-formats";
import { RequestHandler } from "express";

/**
 * Helper function for compiling a validation schema, that abstracts away the
 * underlying package being used.
 */
export function compileValidationSchema<T>(schema: JSONSchemaType<T>) {
  return ajv.compile<T>(schema);
}

/**
 * Express request handler for validating the request against a compiled
 * validation schema.
 *
 * By default it will validate the request body, but this can be overridden
 * using the `props` parameter to alternatively validate the request query or
 * params.
 *
 * In general the body should be used for HTTP POST/PUT payloads, the query
 * should be used for HTTP GET payloads, and the params should be used for
 * HTTP DELETE payloads and/or when the URI path contains variable components.
 */
export function validateRequest(
  validate: ValidateFunction,
  prop: "body" | "query" | "params" = "body",
): RequestHandler {
  return async (req, res, next) => {
    const valid = validate(req[prop]);
    if (!valid) {
      res.status(400);
      res.json(validate.errors);
    } else {
      next();
    }
  };
}

/**
 * Register custom validation functions.
 */
export function addCustomValidation(keyword: KeywordDefinition) {
  ajv.addKeyword(keyword);
}

// QUIRK: the default import isn't working as documented
// https://github.com/ajv-validator/ajv/issues/2132
const ajv = new Ajv.default({ allErrors: true });
formatsPlugin.default(ajv);
