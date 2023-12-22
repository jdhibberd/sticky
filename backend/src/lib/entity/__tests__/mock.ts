/**
 * Helpers for using mock entities in unit tests.
 */

import { type Note } from "../notes.js";
import { type User } from "../users.js";

class Mock {
  private static i = 0;

  static number(): number {
    return this.i++;
  }

  static string(): string {
    return String(this.number());
  }
}

export function note({
  id = Mock.string(),
  content = Mock.string(),
  path = Mock.string(),
  authorId = Mock.string(),
  modified = Mock.number(),
}: Partial<Note> = {}): Note {
  return { id, content, path, authorId, modified };
}

export function user({
  id = Mock.string(),
  name = Mock.string(),
  email = Mock.string(),
}: Partial<User> = {}): User {
  return { id, name, email };
}
