import React, { useState } from "react";
import { NOTE_CONTENT_MAXLEN } from "../lib/backend-const.gen.js";

type Props = {
  name: string;
  parentId: string | null;
};

export default function ComposableNote({ name, parentId }: Props) {
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
        body: JSON.stringify({ content: state, parentId: parentId }),
      });
      setState("");
      dispatchEvent(new Event("notesChanged"));
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(event.target.value);
  };

  const onBlur = () => {
    setState("");
  };

  return (
    <div className="note">
      <div className="content content-editable">
        <textarea
          id="compose-note"
          onChange={onChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
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
