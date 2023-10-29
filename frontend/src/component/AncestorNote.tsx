import React from "react";
import type { Note } from "@/backend/entity/notes.js";
import { navigateToNote } from "../lib/util.js";

type Props = {
  note: Note;
};

export default function AncestorNote({ note }: Props) {
  const onContentClick = () => {
    navigateToNote(note, true);
  };

  return (
    <div className="note note-link" onClick={onContentClick}>
      <div className="content">{note.content}</div>
      <div className="footer">
        <div className="author">John</div>
      </div>
    </div>
  );
}
