import React, { useState } from "react";
import { SESSION_NAME_MAXLEN } from "../lib/backend-const.gen.js";
import FormField from "./FormField.js";

export default function SignIn() {
  const [state, setState] = useState<string>("");

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(event.target.value);
  };

  const onSubmitClick = async () => {
    if (state.length === 0) {
      return;
    }
    await fetch("/api/signin", {
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
        <FormField label={"Enter your name:"}>
          <input
            name="name"
            autoComplete="given-name"
            type="text"
            onChange={onNameChange}
            value={state}
            maxLength={SESSION_NAME_MAXLEN}
          ></input>
        </FormField>
      </div>
      <div className="row submit">
        <button onClick={onSubmitClick}>Sign in</button>
      </div>
    </div>
  );
}
