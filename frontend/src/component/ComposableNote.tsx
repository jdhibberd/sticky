import React, { useState } from "react";
import { getNotePath } from "../lib/util.js";

type Props = {
  name: string;
};

export default function ComposableNote({ name }: Props) {
  const [state, setState] = useState<string>("");

  const onKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.code === "Enter") {
      event.preventDefault();
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: state, likes: 0, path: getNotePath() }),
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
        <textarea onChange={onChange} onKeyDown={onKeyDown} value={state} />
      </div>
      <div className="footer">
        <div className="author">{name}</div>
      </div>
    </div>
  );
}
