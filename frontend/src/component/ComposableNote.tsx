import React, { useState } from "react";
import { getNotePath } from "../lib/util.js";

export default function ComposableNote() {
  const [state, setState] = useState<string>("");

  const onKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.code === "Enter") {
      event.preventDefault();
      const content = state;
      const path = getNotePath();
      setState("");
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, path }),
      });
      dispatchEvent(new Event("notesChanged"));
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(event.target.value);
  };

  return (
    <div className="note">
      <div className="content">
        <textarea
          autoFocus
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={state}
        />
      </div>
      <div className="footer">
        <div className="author">John</div>
      </div>
    </div>
  );
}
