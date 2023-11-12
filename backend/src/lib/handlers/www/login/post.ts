import { type Request, Router } from "express";
import { newSession } from "../../../auth.js";
import {
  compileValidationSchema,
  validateRequest,
} from "../../../validation.js";

type Payload = {
  name: string;
};

const validate = compileValidationSchema<Payload>({
  type: "object",
  properties: {
    name: { type: "string", minLength: 2, maxLength: 64 },
  },
  required: ["name"],
  additionalProperties: false,
});

export default Router()
  .post("/login", validateRequest(validate))
  .post("/login", async (req: Request<object, object, Payload>, res, next) => {
    try {
      await newSession(res, req.body.name);
      res.end();
    } catch (e) {
      next(e);
    }
  });
