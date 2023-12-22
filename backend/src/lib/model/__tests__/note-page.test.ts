import { type Note } from "../../entity/notes.js";
import { type User } from "../../entity/users.js";
import { type LikesByNoteIds } from "../../entity/likes.js";
import { buildNotePageModel } from "../note-page.js";

test("no notes", async () => {
  const path = "";
  const notes: Note[] = [];
  const likes: LikesByNoteIds = { likeCounts: [], likesByUser: [] };
  const authors: User[] = [];
  const user = { id: "a", name: "foo", email: "x" };
  expect(buildNotePageModel(path, notes, likes, authors, user)).toStrictEqual({
    ancestors: [],
    parentId: null,
    notes: [],
    user: { name: user.name },
  });
});

test(`simple view with ancestors, children, and children with children`, async () => {
  const path = "a";
  const nodes: Note[] = [
    { id: "a", content: "xxx", path: "", authorId: "f", modified: 0 },
    { id: "b", content: "xxx", path: "a", authorId: "f", modified: 1 },
    { id: "c", content: "xxx", path: "a", authorId: "g", modified: 2 },
    { id: "d", content: "xxx", path: "a", authorId: "g", modified: 3 },
    { id: "e", content: "xxx", path: "a/b", authorId: "g", modified: 4 },
  ];
  const likes: LikesByNoteIds = {
    likeCounts: [
      { noteId: "b", count: 7 },
      { noteId: "d", count: 2 },
    ],
    likesByUser: ["d"],
  };
  const authors: User[] = [
    { id: "f", name: "F", email: "x" },
    { id: "g", name: "G", email: "x" },
  ];
  const user = { id: "a", name: "foo", email: "x" };
  expect(
    buildNotePageModel(path, Object.values(nodes), likes, authors, user),
  ).toStrictEqual({
    ancestors: [{ id: "a", content: "xxx", parentId: null }],
    parentId: "a",
    notes: [
      {
        id: "b",
        content: "xxx",
        author: { name: "F" },
        likeCount: 7,
        likedByUser: false,
      },
      {
        id: "d",
        content: "xxx",
        author: { name: "G" },
        likeCount: 2,
        likedByUser: true,
      },
      {
        id: "c",
        content: "xxx",
        author: { name: "G" },
        likeCount: 0,
        likedByUser: false,
      },
    ],
    user: { name: user.name },
  });
});
