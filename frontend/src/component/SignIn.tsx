import React, { useState } from "react";
import { SESSION_NAME_MAXLEN } from "../lib/backend-const.gen.js";

export default function SignIn() {
  const [state, setState] = useState<string>("");

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(event.target.value);
  };

  const onLoginClick = async () => {
    if (state.length === 0) {
      return;
    }
    await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: state }),
    });
    window.location.replace("/");
  };

  return (
    <div className="unauth-form">
      <div className="row">Sign in to your account.</div>
      <div className="row">
        <div>Enter your name:</div>
        <input
          type="text"
          onChange={onNameChange}
          value={state}
          maxLength={SESSION_NAME_MAXLEN}
        ></input>
      </div>
      <div className="row submit">
        <button onClick={onLoginClick}>Sign in</button>
      </div>
    </div>
  );
}
