import type { Note } from "../../entity/notes.js";
import type { LikesByNoteIds } from "../../entity/likes.js";
import { buildNotePageModel } from "../note-page.js";

test("no notes", async () => {
  const path = "";
  const notes: Note[] = [];
  const likes: LikesByNoteIds = { likeCounts: [], likesByUser: [] };
  const userName = "foo";
  expect(buildNotePageModel(path, notes, likes, userName)).toStrictEqual({
    ancestors: [],
    notes: [],
    user: { name: "foo" },
  });
});

test(`simple view with ancestors, children, and children with children`, async () => {
  const path = "a";
  const nodes: Note[] = [
    { id: "a", content: "xxx", path: "" },
    { id: "b", content: "xxx", path: "a" },
    { id: "c", content: "xxx", path: "a" },
    { id: "d", content: "xxx", path: "a" },
    { id: "e", content: "xxx", path: "a/b" },
  ];
  const likes: LikesByNoteIds = {
    likeCounts: [
      { noteId: "b", count: 7 },
      { noteId: "d", count: 2 },
    ],
    likesByUser: ["d"],
  };
  const userName = "foo";
  expect(
    buildNotePageModel(path, Object.values(nodes), likes, userName),
  ).toStrictEqual({
    ancestors: [{ id: "a", content: "xxx", path: "" }],
    notes: [
      {
        id: "b",
        content: "xxx",
        path: "a",
        hasChildren: true,
        likeCount: 7,
        likedByUser: false,
      },
      {
        id: "c",
        content: "xxx",
        path: "a",
        hasChildren: false,
        likeCount: 0,
        likedByUser: false,
      },
      {
        id: "d",
        content: "xxx",
        path: "a",
        hasChildren: false,
        likeCount: 2,
        likedByUser: true,
      },
    ],
    user: { name: "foo" },
  });
});
