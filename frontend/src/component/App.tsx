import React, { useEffect, useState } from "react";
import type { NotePageModel } from "@/backend/model/note-page.js";
import ComposableNote from "./ComposableNote.js";
import EditableNote from "./EditableNote.js";
import AncestorNote from "./AncestorNote.js";
import { getNotePath } from "../lib/util.js";
import PlaceholderNote from "./PlaceholderNote.js";
import { NOTE_PATH_MAXDEPTH } from "../lib/backend-const.gen.js";

export default function App() {
  const [state, setState] = useState<NotePageModel>();

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
    const placeholderCount = NOTE_PATH_MAXDEPTH - state.ancestors.length;
    return (
      <div className="note-container note-container-ancestors">
        {state.ancestors.map((note) => (
          <AncestorNote key={note.id} note={note} />
        ))}
        {[...Array(placeholderCount).keys()].map((i) => (
          <PlaceholderNote key={`placeholder-${i}`} />
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
        {state.notes.map((note) => (
          <EditableNote key={note.id} note={note} />
        ))}
        <ComposableNote name={state.user.name} />
      </div>
    </>
  );
}
