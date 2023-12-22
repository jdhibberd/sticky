import { jest } from "@jest/globals";
import {
  BadRequestError,
  checkProps,
  checkUUID,
  checkString,
  checkPathDepth,
  checkNoteExists,
} from "../validation.js";
import { type Note } from "../entity/notes.js";

describe("checkProps", () => {
  test("basic", () => {
    expect(checkProps("/x", { a: 1, b: 2 }, ["a", "b"])).toBeUndefined();
  });

  test("extra", () => {
    expect(() => checkProps("/x", { a: 1, b: 2, c: 3 }, ["a", "b"])).toThrow(
      BadRequestError,
    );
  });

  test("missing", () => {
    expect(() => checkProps("/x", { a: 1 }, ["a", "b"])).toThrow(
      BadRequestError,
    );
  });

  test("undefined", () => {
    expect(() => checkProps("/x", { a: 1, b: undefined }, ["a", "b"])).toThrow(
      BadRequestError,
    );
  });

  test("empty", () => {
    expect(checkProps("/x", {}, [])).toBeUndefined();
  });
});

describe("checkUUID", () => {
  test("basic", () => {
    expect(
      checkUUID("/x", "cf574d93-705c-43da-8a93-a2ccbd5de2bd"),
    ).toBeUndefined();
  });

  test("missing", () => {
    expect(() => checkUUID("/x", null)).toThrow(BadRequestError);
  });

  test("optional", () => {
    expect(checkUUID("/x", null, { optional: true })).toBeUndefined();
  });

  test("malformed", () => {
    expect(
      // 'a' prefix
      () => checkUUID("/x", "acf574d93-705c-43da-8a93-a2ccbd5de2bd"),
    ).toThrow(BadRequestError);
  });

  test("empty string", () => {
    expect(() => checkUUID("/x", "", { optional: true })).toThrow(
      BadRequestError,
    );
  });
});

describe("checkString", () => {
  test("basic", () => {
    expect(checkString("/x", "hello")).toBeUndefined();
  });

  test("empty string", () => {
    expect(checkString("/x", "")).toBeUndefined();
  });

  test("non-string", () => {
    expect(() => checkString("/x", 42)).toThrow(BadRequestError);
  });

  test("missing", () => {
    expect(() => checkString("/x", null)).toThrow(BadRequestError);
  });

  test("optional", () => {
    expect(checkString("/x", null, { optional: true })).toBeUndefined();
  });

  test("too short", () => {
    expect(() => checkString("/x", "hello", { minLength: 6 })).toThrow(
      BadRequestError,
    );
  });

  test("too long", () => {
    expect(() => checkString("/x", "hello", { maxLength: 4 })).toThrow(
      BadRequestError,
    );
  });
});

const NOTE_PROTO: Note = {
  id: "a",
  content: "xxx",
  path: "",
  authorId: "",
  modified: 0,
};

describe("checkPathDepth", () => {
  test("basic", () => {
    const note = { ...NOTE_PROTO, path: "a/b", id: "c" };
    expect(checkPathDepth("/x", note)).toBe("a/b/c");
  });

  test("null", () => {
    expect(checkPathDepth("/x", null)).toBe("");
  });

  test("root", () => {
    const note = { ...NOTE_PROTO, path: "", id: "a" };
    expect(checkPathDepth("/x", note)).toBe("a");
  });

  test("exceeds", () => {
    const note = { ...NOTE_PROTO, path: "a/b/c/d", id: "e" };
    expect(() => checkPathDepth("/x", note)).toThrow(BadRequestError);
  });
});

describe("checkNoteExists", () => {
  test("basic", async () => {
    const { notes } = await import("../entity/notes.js");
    const f = (notes.selectById = jest.fn(
      async (): Promise<Note> => NOTE_PROTO,
    ));
    try {
      await expect(checkNoteExists("/x", "a")).resolves.toBe(NOTE_PROTO);
    } finally {
      notes.selectById = f;
    }
  });

  test("missing", async () => {
    const { notes } = await import("../entity/notes.js");
    const f = (notes.selectById = jest.fn(async (): Promise<null> => null));
    try {
      await expect(checkNoteExists("/x", "a")).rejects.toThrow(BadRequestError);
    } finally {
      notes.selectById = f;
    }
  });

  test("null", async () => {
    await expect(checkNoteExists("/x", null)).resolves.toBeNull();
  });
});
