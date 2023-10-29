import { ParamBuilder } from "../util.js";

test("ParamBuilder basic", async () => {
  const param = new ParamBuilder();
  expect(
    `
    XXX ${param.insert()}
    YYY ${param.insert(2)}
    ZZZ ${param.insert(3)}
    `,
  ).toBe(
    `
    XXX $1
    YYY $2, $3
    ZZZ $4, $5, $6
    `,
  );
});
