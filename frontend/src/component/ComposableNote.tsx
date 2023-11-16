import React, { useState } from "react";
import { getNotePath } from "../lib/util.js";
import { NOTE_CONTENT_MAXLEN } from "../lib/backend-const.gen.js";

type Props = {
  name: string;
};

export default function ComposableNote({ name }: Props) {
  const [state, setState] = useState<string>("");

  const onKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.code === "Enter") {
      event.preventDefault();
      if (state.length === 0) {
        return;
      }
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: state, path: getNotePath() }),
      });
      setState("");
      dispatchEvent(new Event("notesChanged"));
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(event.target.value);
  };

  return (
    <div className="note">
      <div className="content content-editable">
        <textarea
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={state}
          maxLength={NOTE_CONTENT_MAXLEN}
        />
      </div>
      <div className="footer">
        <div className="author">{name}</div>
      </div>
    </div>
  );
}
