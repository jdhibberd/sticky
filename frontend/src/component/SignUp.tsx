import React, { useState } from "react";
import FormField from "./FormField.js";
import { Form } from "../lib/validation.js";
import { type FormValidationResult } from "@/backend/validation.js";
import { USER_EMAIL_MAXLEN } from "../lib/backend-const.gen.js";

type State = {
  input: {
    email: string;
    name: string;
    otp: string;
  };
  validation: {
    email: FormValidationResult;
    name: FormValidationResult;
    otp: FormValidationResult;
  };
};

export default function SignUp() {
  const form = new Form(["email", "name", "otp"]);

  const [state, setState] = useState<State>({
    input: {
      email: "",
      name: "",
      otp: "",
    },
    validation: {
      email: null,
      name: null,
      otp: null,
    },
  });

  const onSubmitClick = async () => {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form.getPayload(state.input)),
    });
    const validation = await response.json();
    if (response.status === 200 || response.status === 400) {
      if (form.isComplete(validation)) {
        console.log("SUCCESS");
        // window.location.replace("/");
      } else {
        const input = form.updateInputState(state.input, validation);
        setState((prevState) => ({ ...prevState, input, validation }));
      }
    }
  };

  const onInputChange = (k: string, v: string) => {
    setState((prevState) => {
      return { ...prevState, input: { ...prevState.input, [k]: v } };
    });
  };

  const renderEmailField = () => {
    return (
      <div className="row">
        <FormField
          label={"Enter your email:"}
          validation={state.validation.email}
        >
          <input
            name="email"
            type="text"
            maxLength={USER_EMAIL_MAXLEN}
            autoComplete="email"
            onChange={(event) => onInputChange("email", event.target.value)}
            value={state.input.email}
          ></input>
        </FormField>
      </div>
    );
  };

  const renderNameField = () => {
    if (!form.isFieldVisible("name", state.validation)) {
      return null;
    }
    return (
      <div className="row">
        <FormField
          label={"Enter your name:"}
          validation={state.validation.name}
        >
          <input
            name="name"
            autoComplete="given-name"
            type="text"
            onChange={(event) => onInputChange("name", event.target.value)}
            value={state.input.name}
          ></input>
        </FormField>
      </div>
    );
  };

  const renderOTPField = () => {
    if (!form.isFieldVisible("otp", state.validation)) {
      return null;
    }
    return (
      <div className="row">
        <FormField
          label={"Enter the code sent to your email:"}
          validation={state.validation.otp}
        >
          <input
            name="otp"
            type="text"
            onChange={(event) => onInputChange("otp", event.target.value)}
            value={state.input.otp}
          ></input>
        </FormField>
      </div>
    );
  };

  const renderNextButton = () => {
    const text = form.isFieldVisible("otp", state.validation)
      ? "Create account"
      : "Continue";
    return (
      <div className="row submit">
        <button onClick={onSubmitClick}>{text}</button>
      </div>
    );
  };

  return (
    <div className="unauth-form">
      <div className="row">Create a new account.</div>
      {renderEmailField()}
      {renderNameField()}
      {renderOTPField()}
      {renderNextButton()}
    </div>
  );
}
