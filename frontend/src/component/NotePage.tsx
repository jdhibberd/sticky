import React from "react";
import ComposableNote from "./ComposableNote.js";
import EditableNote from "./EditableNote.js";
import AncestorNote from "./AncestorNote.js";
import PlaceholderNote from "./PlaceholderNote.js";
import { NOTE_PATH_MAXDEPTH } from "../lib/backend-const.gen.js";
import { type NotePageModel } from "@/backend/model/note-page.js";

type Props = {
  data: NotePageModel;
};

export default function NotePage({ data }: Props) {
  const renderAncestors = () => {
    if (!data.ancestors.length) {
      return null;
    }
    // -1 because the final depth will be the notes under the ancestors
    const placeholderCount = NOTE_PATH_MAXDEPTH - data.ancestors.length - 1;
    return (
      <div className="note-container note-container-ancestors">
        {data.ancestors.map((note) => (
          <AncestorNote key={note.id} note={note} />
        ))}
        {[...Array(placeholderCount).keys()].map((i) => (
          <PlaceholderNote key={`placeholder-${i}`} />
        ))}
      </div>
    );
  };

  return (
    <>
      {renderAncestors()}
      <div className="note-container">
        {data.notes.map((note) => (
          <EditableNote
            key={note.id}
            note={note}
            depth={data.ancestors.length + 1}
          />
        ))}
        <ComposableNote name={data.user.name} parentId={data.parentId} />
      </div>
    </>
  );
}
