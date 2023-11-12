import { type Request, Router } from "express";
import { likes } from "../../../entity/likes.js";
import {
  compileValidationSchema,
  validateRequest,
} from "../../../validation.js";

type Payload = {
  id: string;
};

const validate = compileValidationSchema<Payload>({
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
  },
  required: ["id"],
  additionalProperties: false,
});

export default Router()
  .delete("/api/likes/:id", validateRequest(validate, "params"))
  .delete("/api/likes/:id", async (req: Request<Payload>, res, next) => {
    try {
      await likes.drop(process.env.USER_ID!, req.params.id);
      res.status(204);
      res.end();
    } catch (e) {
      next(e);
    }
  });
