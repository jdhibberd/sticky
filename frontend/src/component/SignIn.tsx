import React, { useState } from "react";
import { USER_NAME_MAXLEN } from "../lib/backend-const.gen.js";
import FormField from "./FormField.js";

export default function SignIn() {
  const [state, setState] = useState<string>("");

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(event.target.value);
  };

  const onSubmitClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // prevent browser refresh
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
    <form className="unauth">
      <div className="row">Sign in to your account.</div>
      <div className="row">
        <FormField label={"Enter your name:"} fieldId="name">
          <input
            id="name"
            type="text"
            autoComplete="off"
            onChange={onNameChange}
            value={state}
            maxLength={USER_NAME_MAXLEN}
          ></input>
        </FormField>
      </div>
      <div className="row submit">
        <button onClick={onSubmitClick}>Sign in</button>
      </div>
    </form>
  );
}
