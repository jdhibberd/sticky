import React from "react";
import type { AncestorNote } from "@/backend/model/note-page.js";

type Props = {
  note: AncestorNote;
};

export default function AncestorNote({ note }: Props) {
  const onContentClick = () => {
    window.location.hash = note.parentId || "";
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
