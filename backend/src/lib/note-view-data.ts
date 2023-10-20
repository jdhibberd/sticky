import type { Note } from "./entity.js";

export type NoteViewData = {
  ancestors: Note[];
  children: Note[];
  childrenWithChildren: string[];
};

/**
 * Extract the ordered list of note ancestor ids given a note path.
 */
export function getAncestorIdsFromNotePath(path: string): string[] {
  return path.split("/");
}

/**
 * Given a set of matching note entities and a note path, build the structured
 * data necessary to render a note view on the client.
 */
export function buildNoteViewData(path: string, notes: Note[]): NoteViewData {
  const notesById = new Map<string, Note>(notes.map((note) => [note.id, note]));
  const ancestorIds = getAncestorIdsFromNotePath(path);
  const ancestors = ancestorIds
    .map((id) => notesById.get(id))
    .filter((note) => note !== undefined) as Note[];
  const children = notes.filter((note) => note.path === path);
  const parents = new Set(
    notes.map((note) => note.path.split("/").reverse()[0]),
  );
  const childrenWithChildren = children
    .filter((note) => parents.has(note.id))
    .map((note) => note.id);
  return { ancestors, children, childrenWithChildren };
}
