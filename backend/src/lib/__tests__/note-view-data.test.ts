import { Note } from "../entity.js";
import { buildNoteViewData } from "../note-view-data.js";

test("no notes", async () => {
  const path = "";
  const notes: Note[] = [];
  expect(buildNoteViewData(path, notes)).toStrictEqual({
    ancestors: [],
    children: [],
    childrenWithChildren: [],
  });
});

test(`simple view with ancestors, children, and children with children`, async () => {
  const path = "a";
  const nodes = {
    a: { id: "a", content: "xxx", likes: 0, path: "" },
    b: { id: "b", content: "xxx", likes: 0, path: "a" },
    c: { id: "c", content: "xxx", likes: 0, path: "a" },
    d: { id: "d", content: "xxx", likes: 0, path: "a/b" },
  };
  expect(buildNoteViewData(path, Object.values(nodes))).toStrictEqual({
    ancestors: [nodes.a],
    children: [nodes.b, nodes.c],
    childrenWithChildren: ["b"],
  });
});
