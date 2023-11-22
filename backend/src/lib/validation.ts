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

import { type Note, PATH_MAXDEPTH } from "./entity/notes.js";
import { notes } from "./entity/notes.js";
import { NotePath } from "./util.js";

const UUID_PATTERN =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

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
