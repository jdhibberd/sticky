import { type Request, Router } from "express";
import { notes } from "../../../entity/notes.js";
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
  .delete("/api/notes/:id", validateRequest(validate, "params"))
  .delete("/api/notes/:id", async (req: Request<Payload>, res, next) => {
    try {
      const note = await notes.selectById(req.params.id);
      if (note === null) {
        res.status(404);
        res.end();
        return;
      }
      await notes.dropRecursively(note);
      res.status(204);
      res.end();
    } catch (e) {
      next(e);
    }
  });
