import type { Note as NoteEntity } from "../entity/notes.js";
import type { LikesByNoteIds } from "../entity/likes.js";

type NoteEntityExtra = {
  hasChildren: boolean;
  likeCount: number;
  likedByUser: boolean;
};
export type Note = NoteEntity & NoteEntityExtra;
export type NotePageModel = {
  ancestors: NoteEntity[];
  notes: Note[];
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
export function buildNotePageModel(
  path: string,
  notesByPath: NoteEntity[],
  likes: LikesByNoteIds,
): NotePageModel {
  const notesById = new Map<string, NoteEntity>(
    notesByPath.map((note) => [note.id, note]),
  );
  const ancestorIds = getAncestorIdsFromNotePath(path);
  const ancestors = ancestorIds
    .map((id) => notesById.get(id))
    .filter((note) => note !== undefined) as NoteEntity[];
  const notesDirectChildren = notesByPath.filter((note) => note.path === path);
  const parents = new Set(
    notesByPath.map((note) => note.path.split("/").reverse()[0]),
  );
  const likeCounts = new Map(
    likes.likeCounts.map((entry) => [entry.noteId, entry.count]),
  );
  const likesByUser = new Set(likes.likesByUser);
  const notes = notesDirectChildren.map((note: NoteEntity) =>
    Object.assign<NoteEntityExtra, NoteEntity>(
      {
        hasChildren: parents.has(note.id),
        likeCount: likeCounts.get(note.id) ?? 0,
        likedByUser: likesByUser.has(note.id),
      },
      note,
    ),
  );
  return { ancestors, notes };
}
