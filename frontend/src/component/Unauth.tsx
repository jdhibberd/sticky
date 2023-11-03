import React, { useState } from "react";

export default function Unauth() {
  const [state, setState] = useState<string>("");

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(event.target.value);
  };

  const onLoginClick = async () => {
    await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: state }),
    });
    window.location.replace("/");
  };

  return (
    <div className="unauth">
      <div className="form">
        <h1>Sticky</h1>
        <div className="name">
          <div className="label">Your name:</div>
          <input type="text" onChange={onNameChange} value={state}></input>
        </div>
        <button onClick={onLoginClick}>Login</button>
      </div>
    </div>
  );
}
