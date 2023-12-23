import { type Note as NoteEntity } from "../entity/notes.js";
import { type User } from "../entity/users.js";
import { type LikesByNoteIds } from "../entity/likes.js";
import { NotePath } from "../util.js";

export type AncestorNote = {
  id: string;
  content: string;
  author: { name: string };
  parentId: string | null;
};
export type Note = {
  id: string;
  content: string;
  author: { name: string };
  likeCount: number;
  likedByUser: boolean;
};
export type NotePageModel = {
  ancestors: AncestorNote[];
  parentId: string | null;
  notes: Note[];
  user: { name: string };
};

/**
 * Given a set of matching note entities and a note path, build the structured
 * data necessary to render a note view on the client.
 */
export function buildNotePageModel(
  path: string,
  notes: NoteEntity[],
  likes: LikesByNoteIds,
  authors: User[],
  user: User,
): NotePageModel {
  const notesById = new Map<string, NoteEntity>(notes.map((o) => [o.id, o]));
  const authorById = new Map(authors.map(({ id, name }) => [id, { name }]));
  const ancestorIds = NotePath.split(path);
  let parentId = null;
  const notesAncestors = ancestorIds.map((id) => {
    const note = notesById.get(id);
    if (note === undefined) {
      throw new Error("ancestor note not found");
    }
    parentId = id;
    return {
      id: note.id,
      content: note.content,
      author: authorById.get(note.authorId)!,
      parentId: NotePath.getParent(note.path),
    };
  });
  const likeCounts = new Map(likes.likeCounts.map((o) => [o.noteId, o.count]));
  const likesByUser = new Set(likes.likesByUser);
  const notesChildren = notes
    .filter((note) => note.path === path)
    .sort(
      (a, b) =>
        (likeCounts.get(b.id) ?? 0) - (likeCounts.get(a.id) ?? 0) ||
        b.modified - a.modified,
    )
    .map((note: NoteEntity) => ({
      id: note.id,
      content: note.content,
      author: authorById.get(note.authorId)!,
      likeCount: likeCounts.get(note.id) ?? 0,
      likedByUser: likesByUser.has(note.id),
    }));
  return {
    ancestors: notesAncestors,
    parentId,
    notes: notesChildren,
    user: { name: user.name },
  };
}
