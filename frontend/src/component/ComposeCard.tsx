import React, { useState } from "react";

export default function ComponseCard() {
  const [state, setState] = useState<string>("");

  const onKeyDown = async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.code === "Enter") {
      event.preventDefault();
      const name = state;
      setState("");
      await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name }),
      });
      dispatchEvent(new Event("collectionsChanged"));
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(event.target.value);
  };

  return (
    <div className="compose-card">
      <div className="content">
        <textarea
          autoFocus
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={state}
        />
      </div>
      <div className="footer">John</div>
    </div>
  );
}
