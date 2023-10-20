import React, { useEffect, useState } from "react";
import type { NoteViewData } from "@/backend/note-view-data.js";
import ComposableNote from "./ComposableNote.js";
import EditableNote from "./EditableNote.js";
import AncestorNote from "./AncestorNote.js";
import { getNotePath } from "../lib/util.js";

export default function App() {
  const [state, setState] = useState<NoteViewData>();

  useEffect(() => {
    addEventListener("notesChanged", onNotesChanged);
    addEventListener("hashchange", onHashChanged);
    fetchData();
  }, []);

  const onNotesChanged = () => {
    fetchData();
  };

  const onHashChanged = () => {
    fetchData();
  };

  const fetchData = async () => {
    const path = getNotePath();
    const response = await fetch(`/api/notes?path=${path}`);
    const result = await response.json();
    setState(result);
  };

  const renderAncestors = () => {
    if (!state?.ancestors.length) {
      return null;
    }
    return (
      <div className="note-container note-container-ancestors">
        {state.ancestors.map((note) => (
          <AncestorNote key={note.id} note={note} />
        ))}
      </div>
    );
  };

  if (state === undefined) {
    return null;
  }
  return (
    <>
      {renderAncestors()}
      <div className="note-container">
        {state.children.map((note) => (
          <EditableNote
            key={note.id}
            note={note}
            hasChildren={state.childrenWithChildren.includes(note.id)}
          />
        ))}
        <ComposableNote />
      </div>
    </>
  );
}
