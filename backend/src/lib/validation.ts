import Ajv, { JSONSchemaType, ValidateFunction } from "ajv";
import formatsPlugin from "ajv-formats";
import { RequestHandler } from "express";
import { type Note } from "./entity/notes.js";
import { notes } from "./entity/notes.js";

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

// QUIRK: the default import isn't working as documented
// https://github.com/ajv-validator/ajv/issues/2132
const ajv = new Ajv.default({ allErrors: true });
formatsPlugin.default(ajv);

/**
 * Raised when a entity model rule is violated, typically in response to a bad
 * request from the client.
 */
export class IntegrityError extends Error {}

/**
 * Check that a referenced Note entity exists. If the id is null then skip the
 * check, which can happen if the 'root' of a note tree is being referenced.
 */
export async function checkNoteExists(
  id: string | null | undefined,
): Promise<Note | null> {
  if (id === null || id === undefined) {
    return null;
  }
  const note = await notes.selectById(id);
  if (note === null) {
    throw new IntegrityError(`Note entity ${id} not found.`);
  }
  return note;
}
