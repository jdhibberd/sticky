import React, { useState } from "react";

export default function Componse() {
  const [state, setState] = useState<string>("");

  const onKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.code === "Enter") {
      const name = state;
      setState("");
      await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name }),
      });
      dispatchEvent(new Event("composed"));
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(event.target.value);
  };

  return (
    <input
      type="text"
      onChange={onChange}
      onKeyDown={onKeyDown}
      value={state}
    ></input>
  );
}
