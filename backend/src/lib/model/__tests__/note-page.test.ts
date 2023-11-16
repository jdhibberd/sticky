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
    { id: "a", content: "xxx", path: "", modified: 0 },
    { id: "b", content: "xxx", path: "a", modified: 0 },
    { id: "c", content: "xxx", path: "a", modified: 0 },
    { id: "d", content: "xxx", path: "a", modified: 0 },
    { id: "e", content: "xxx", path: "a/b", modified: 0 },
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
    ancestors: [{ id: "a", content: "xxx", path: "", modified: 0 }],
    notes: [
      {
        id: "b",
        content: "xxx",
        path: "a",
        modified: 0,
        hasChildren: true,
        likeCount: 7,
        likedByUser: false,
      },
      {
        id: "c",
        content: "xxx",
        path: "a",
        modified: 0,
        hasChildren: false,
        likeCount: 0,
        likedByUser: false,
      },
      {
        id: "d",
        content: "xxx",
        path: "a",
        modified: 0,
        hasChildren: false,
        likeCount: 2,
        likedByUser: true,
      },
    ],
    user: { name: "foo" },
  });
});
