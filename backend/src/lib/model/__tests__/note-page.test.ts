import type { Note } from "../../entity/notes.js";
import type { LikesByNoteIds } from "../../entity/likes.js";
import { buildNotePageModel } from "../note-page.js";

test("no notes", async () => {
  const path = "";
  const notes: Note[] = [];
  const likes: LikesByNoteIds = { likeCounts: [], likesByUser: [] };
  expect(buildNotePageModel(path, notes, likes)).toStrictEqual({
    ancestors: [],
    notes: [],
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
    likesByUser: [{ noteId: "d", id: "f" }],
  };
  expect(buildNotePageModel(path, Object.values(nodes), likes)).toStrictEqual({
    ancestors: [{ id: "a", content: "xxx", path: "" }],
    notes: [
      {
        id: "b",
        content: "xxx",
        path: "a",
        hasChildren: true,
        likeCount: 7,
        likedByUser: null,
      },
      {
        id: "c",
        content: "xxx",
        path: "a",
        hasChildren: false,
        likeCount: 0,
        likedByUser: null,
      },
      {
        id: "d",
        content: "xxx",
        path: "a",
        hasChildren: false,
        likeCount: 2,
        likedByUser: "f",
      },
    ],
  });
});
