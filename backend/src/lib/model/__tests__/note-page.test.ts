import { type Note } from "../../entity/notes.js";
import { type User } from "../../entity/users.js";
import { type LikesByNoteIds } from "../../entity/likes.js";
import { buildNotePageModel } from "../note-page.js";
import * as mock from "../../entity/__tests__/mock.js";

test("no notes", async () => {
  const path = "";
  const notes: Note[] = [];
  const likes: LikesByNoteIds = { likeCounts: [], likesByUser: [] };
  const authors: User[] = [];
  const user = mock.user();
  expect(buildNotePageModel(path, notes, likes, authors, user)).toStrictEqual({
    ancestors: [],
    parentId: null,
    notes: [],
    user: { name: user.name },
  });
});

test(`simple view with ancestors, children, and children with children`, async () => {
  const users = [mock.user(), mock.user(), mock.user()];
  const note1 = mock.note({ path: "", authorId: users[1].id, modified: 0 });
  const note2 = mock.note({
    path: `${note1.id}`,
    authorId: users[1].id,
    modified: 1,
  });
  const note3 = mock.note({
    path: `${note1.id}`,
    authorId: users[2].id,
    modified: 2,
  });
  const note4 = mock.note({
    path: `${note1.id}`,
    authorId: users[2].id,
    modified: 3,
  });
  const note5 = mock.note({
    path: `${note1.id}/${note2.id}`,
    authorId: users[2].id,
    modified: 4,
  });
  const notes = [note1, note2, note3, note4, note5];
  const path = `${note1.id}`;
  const likes: LikesByNoteIds = {
    likeCounts: [
      { noteId: note2.id, count: 7 },
      { noteId: note4.id, count: 2 },
    ],
    likesByUser: [note4.id],
  };
  const authors = [users[1], users[2]];
  expect(
    buildNotePageModel(path, notes, likes, authors, users[0]),
  ).toStrictEqual({
    ancestors: [{ id: note1.id, content: note1.content, parentId: null }],
    parentId: note1.id,
    notes: [
      {
        id: note2.id,
        content: note2.content,
        author: { name: users[1].name },
        likeCount: 7,
        likedByUser: false,
      },
      {
        id: note4.id,
        content: note4.content,
        author: { name: users[2].name },
        likeCount: 2,
        likedByUser: true,
      },
      {
        id: note3.id,
        content: note3.content,
        author: { name: users[2].name },
        likeCount: 0,
        likedByUser: false,
      },
    ],
    user: { name: users[0].name },
  });
});
