import React, { useEffect, useState } from "react";
import { type NotePageModel } from "@/backend/model/note-page.js";
import Avatar from "./Avatar.js";
import NotePage from "./NotePage.js";

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
    const hash = window.location.hash;
    const qs = hash === "" ? "" : hash.substring(1);
    const response = await fetch(`/api/notes?id=${qs}`);
    const result = await response.json();
    setState(result);
  };

  if (state === undefined) {
    return null;
  }
  return (
    <div className="app">
      <main>
        <NotePage data={state} />
      </main>
      <aside>
        <Avatar name={state.user.name} />
      </aside>
    </div>
  );
}
