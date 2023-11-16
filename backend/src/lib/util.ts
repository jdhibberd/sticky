/**
 * Helper functions for working with note entity paths.
 */
export class NotePath {
  private static DELIMITER = "/";

  /**
   * Split a path into individual ancestor note ids.
   *
   * "a/b/c"
   * ->
   * ["a", "b", "c"]
   */
  static split(path: string): string[] {
    if (path === "") return [];
    return path.split(NotePath.DELIMITER);
  }

  /**
   * Return the parent note id from a path.
   *
   * "a/b/c"
   * ->
   * "c"
   */
  static getParent(path: string): string | null {
    return NotePath.split(path).pop() || null;
  }

  /**
   * Append a note id to an existing path.
   *
   * "a/b", "c"
   * ->
   * "a/b/c"
   */
  static append(path: string, id: string): string {
    return `${path}${path === "" ? "" : NotePath.DELIMITER}${id}`;
  }

  /**
   * Return the depth of a path.
   *
   * "a/b/c"
   * ->
   * 3
   */
  static getDepth(path: string): number {
    return NotePath.split(path).length;
  }
}
