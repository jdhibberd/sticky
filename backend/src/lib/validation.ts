/**
 * Validate HTTP request payloads before handlers process them.
 *
 * Each handler has a single `checkRequest` function that performs all the
 * necessary validation checks on the request payload. If any checks fail then
 * `BadRequestError` is thrown, otherwise the handler can trust the data.
 *
 * In general the body should be used for HTTP POST/PUT payloads, the query
 * should be used for HTTP GET payloads, and the params should be used for
 * HTTP DELETE payloads and/or when the URI path contains variable components.
 *
 * The `checkRequest` function is built recursively from increasingly finer
 * checking functions:
 *
 * `
 * function checkRequest(...) {
 *   checkA(...)
 *   checkB(...)
 *   checkC(...)
 * }
 *
 * function checkA(...) {
 *   checkA1(...)
 *   checkA2(...)
 * }
 * `
 *
 * A request payload is a JavaScript object. All properties must be set, which
 * can include `null` but must not include `undefined`.
 *
 * Checking functions that operate at the object property level have a `k`
 * parameter which specifies the key of the property being checked. This key
 * is included in any error message for context. The key format is best
 * illustrated by an example:
 *
 * {
 *   a: {
 *     b: {
 *       c: 42,
 *     }
 *   }
 * }
 *
 * The value 42 is under key '/a/b/c'.
 */

import { OTP_LEN } from "./auth.js";
import { type Note, PATH_MAXDEPTH } from "./entity/notes.js";
import { notes } from "./entity/notes.js";
import { otps } from "./entity/otp.js";
import { EMAIL_MAXLEN, EMAIL_MINLEN, users } from "./entity/users.js";
import { NotePath } from "./util.js";

const UUID_PATTERN =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
const EMAIL_PATTERN = /^[\w-.+]+@([\w-]+\.)+[\w-]{2,4}$/;

/**
 * The exception thrown if any checks fail.
 *
 * This indicates either a syntax or semantic error with the request sent from
 * the client. A syntax error being an error of form, e.g. a number value where
 * a string value was expected. A semantic error being an error of meaning,
 * e.g. updating an entity that doesn't exist.
 *
 * This will result in an HTTP status code of 400 being returned to the client.
 */
export class BadRequestError extends Error {
  key: string | undefined;
}

/**
 * Represents the validation state of a form field on the client.
 *
 * There are three possible states:
 *   - `true` indicates that the field has been validated and passed
 *   - `null` indicates that the field has not yet been validated
 *   - a string value indicates that the field has been validated and failed,
 *     and the reason for the failure is the contents of the string
 */
export type FormValidationResult = true | string | null;

/**
 * Represents the validation state of a form on the client.
 *
 * For examples:
 *
 *   {
 *     "a": true,
 *     "b": true,
 *     "c": "Not a valid number.",
 *     "d": null,
 *   }
 */
export type FormValidationResponse = { [k: string]: FormValidationResult };

/**
 * Build the response to a form validation request from the client.
 *
 * Forms are completed incrementally, which means form input values are
 * validated in order, and processing stops if a field fails validation.
 *
 * If a field is processed that either failed validation or had the value null
 * (i.e. not yet completed), then all subsequent validation values are set to
 * null (i.e. not yet validation), which will result in the client resetting
 * those values.
 *
 * See `FormValidationResponse` for an example return value.
 */
export function buildFormValidationResponse(
  orderedFields: string[],
  values: (string | null | undefined)[],
  error: BadRequestError | undefined,
): FormValidationResponse {
  let skipRest = false;
  const getResult = (
    field: string,
    v: string | null | undefined,
  ): FormValidationResult => {
    if (skipRest === true) {
      return null;
    }
    if (error?.key === `/${field}`) {
      skipRest = true;
      return error!.message;
    }
    if (v === null) {
      skipRest = true;
      return null;
    }
    return true;
  };

  return Object.fromEntries(
    orderedFields.map((field, i) => [field, getResult(field, values[i])]),
  );
}

/**
 * Optional properties sent as part of an HTTP GET request cannot be represented
 * as null, only empty strings. This function replaces them with null.
 */
export function nullifyEmptyString(
  payload: { [k: string]: unknown },
  prop: string,
) {
  if (payload[prop] === "") payload[prop] = null;
}

/**
 * Check that a referenced Note entity exists. If the id is null then skip the
 * check, which can happen if the 'root' of a note tree is being referenced.
 */
export async function checkNoteExists(
  k: string,
  id: string | null,
): Promise<Note | null> {
  try {
    if (checkNull(id, true)) return null;
    const note = await notes.selectById(id as string);
    if (note === null) fail(`Note entity ${id} not found.`);
    return note;
  } catch (e) {
    if (e instanceof BadRequestError) e.key = k;
    throw e;
  }
}

/**
 * Check the depth of a note given the path of its parent.
 */
export function checkPathDepth(k: string, note: Note | null): string {
  try {
    if (note === null) return ""; // note at root
    const path = NotePath.append(note.path, note.id);
    if (NotePath.getDepth(path) >= PATH_MAXDEPTH)
      fail("Note max depth exceeded.");
    return path;
  } catch (e) {
    if (e instanceof BadRequestError) e.key = k;
    throw e;
  }
}

/**
 * Check if a value is a string with possible constraints.
 */
export function checkString(
  k: string,
  v: unknown,
  {
    minLength = 0,
    maxLength = Infinity,
    optional = false,
  }: {
    minLength?: number;
    maxLength?: number;
    optional?: boolean;
  } = {},
): void {
  try {
    if (checkNull(v, optional)) return;
    checkType(v, "string");
    checkMinLength(v as string, minLength);
    checkMaxLength(v as string, maxLength);
  } catch (e) {
    if (e instanceof BadRequestError) e.key = k;
    throw e;
  }
}

/**
 * Check if a value is a UUID.
 */
export function checkUUID(
  k: string,
  v: unknown,
  { optional = false }: { optional?: boolean } = {},
): void {
  try {
    if (checkNull(v, optional)) return;
    checkType(v, "string");
    checkRegex(v as string, UUID_PATTERN, "uuid");
  } catch (e) {
    if (e instanceof BadRequestError) e.key = k;
    throw e;
  }
}

/**
 * Check that an email address is well formed and has the desired availability
 * state.
 */
export async function checkEmail(
  k: string,
  v: unknown,
  { exists }: { exists: boolean },
): Promise<void> {
  try {
    if (checkNull(v, true)) return;
    checkType(v, "string");
    checkMinLength(v as string, EMAIL_MINLEN);
    checkMaxLength(v as string, EMAIL_MAXLEN);
    checkRegex(v as string, EMAIL_PATTERN, "email");
    await checkEmailAvailability(v as string, exists);
  } catch (e) {
    if (e instanceof BadRequestError) e.key = k;
    throw e;
  }
}

/**
 * Check that an OTP is well formed and valid for the given email.
 */
export async function checkOTP(
  k: string,
  v: unknown,
  email: string | null,
): Promise<void> {
  try {
    if (checkNull(email, true) || checkNull(v, true)) return;
    checkType(v, "string");
    checkMinLength(v as string, OTP_LEN);
    checkMaxLength(v as string, OTP_LEN);
    await checkOTPValid(v as string, email as string);
  } catch (e) {
    if (e instanceof BadRequestError) e.key = k;
    throw e;
  }
}

/**
 * Check the availability of an email, throw an exception if the desired
 * availability state is not found.
 */
async function checkEmailAvailability(
  v: string,
  exists: boolean,
): Promise<void> {
  const user = await users.selectByEmail(v);
  if (exists === true && user === null) fail("Email not found.");
  if (exists === false && user !== null) fail("Email already taken.");
}

/**
 * Check that an OTP is valid for the given email.
 */
async function checkOTPValid(v: string, email: string): Promise<void> {
  if ((await otps.select(v, email)) === false) fail("Invalid OTP.");
}

/**
 * Check that an object is well-formed, meaning:
 *
 * - has all expected properties
 * - has no unexpected properties
 * - has all properties set to a valid value (i.e. not undefined)
 */
export function checkProps(k: string, o: object, props: string[]): void {
  try {
    const ps = new Set(props);
    for (const [p, v] of Object.entries(o)) {
      if (ps.delete(p) === false) fail(`Unexpected property '${p}'.`);
      if (v === undefined) fail(`Undefined property '${p}'.`);
    }
    for (const p of ps) fail(`Missing property '${p}'.`);
  } catch (e) {
    if (e instanceof BadRequestError) e.key = k;
    throw e;
  }
}

/**
 * Check if a value is null.
 *
 * A value is allowed to be null if it's marked as optional. In this case true
 * is returned to allow short-circuiting from the calling function, since no
 * further checks need to be performed on a null value:
 *
 * `if (checkNull(v, optional)) return;`
 */
function checkNull(v: unknown, optional: boolean = false): boolean {
  if (v === null) {
    if (optional === false) fail("Required field missing.");
    return true;
  }
  return false;
}

/**
 * Check a value's type.
 *
 * Once a value's type has been verified subsequent checks can use a narrowed
 * type definition:
 *
 * `
 * checkType(v, "string");
 * checkX(v as string, ...);
 * `
 */
function checkType(v: unknown, type: "string"): void {
  if (typeof v !== type) fail(`Not a ${type}.`);
}

/**
 * Check the length of a string value against a lower bound.
 */
function checkMinLength(v: string, n: number): void {
  if (v.length < n) fail(`Length must be at least ${n}.`);
}

/**
 * Check the length of a string value against an upper bound.
 */
function checkMaxLength(v: string, n: number): void {
  if (v.length > n) fail(`Length must be no more than ${n}.`);
}

/**
 * Check a string value against a regex.
 */
function checkRegex(v: string, pattern: RegExp, name: string): void {
  if (v.match(pattern) === null) fail(`Invalid ${name} format.`);
}

/**
 * Syntactic sugar for raising `BadRequestError` exception in check functions.
 */
const fail = (msg: string): void => {
  throw new BadRequestError(msg);
};
