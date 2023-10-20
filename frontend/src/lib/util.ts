import type { Note } from "@/backend/entity.js";

/**
 * Return the path of current note view.
 */
export function getNotePath(): string {
  const hash = window.location.hash;
  return hash === "" ? "" : hash.substring(1);
}

/**
 * Navigate to a note view.
 *
 * @param note The note to be the focus of the view.
 * @param asChild Whether the focus note should be represented as an ancestor
 * or a child.
 */
export function navigateToNote(note: Note, asChild: boolean = false): void {
  let hash;
  if (asChild) {
    hash = note.path;
  } else {
    hash = note.path === "" ? note.id : `${note.path}/${note.id}`;
  }
  window.location.hash = hash;
}
