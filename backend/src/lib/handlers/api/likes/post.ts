import { Router } from "express";
import { likes } from "../../../entity/likes.js";
import {
  compileValidationSchema,
  validateRequest,
} from "../../../validation.js";

type Payload = {
  noteId: string;
};

const validate = compileValidationSchema<Payload>({
  type: "object",
  properties: {
    noteId: { type: "string", format: "uuid" },
  },
  required: ["noteId"],
  additionalProperties: false,
});

export default Router()
  .post("/api/likes", validateRequest(validate))
  .post("/api/likes", async (req, res, next) => {
    try {
      await likes.insert(process.env.USER_ID!, req.body.noteId);
      res.status(201);
      res.end();
    } catch (e) {
      next(e);
    }
  });
