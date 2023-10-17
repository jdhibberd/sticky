import * as handler from "../handler.js";

test("first test test", async () => {
  await expect(handler.getTestDbValue()).resolves.toStrictEqual([
    1,
    "Hello world",
  ]);
});
