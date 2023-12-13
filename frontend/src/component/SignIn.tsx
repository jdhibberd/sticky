import React, { useState } from "react";
import FormField from "./FormField.js";
import { Form } from "../lib/validation.js";
import { type FormValidationResult } from "@/backend/validation.js";
import { USER_EMAIL_MAXLEN, AUTH_OTP_LEN } from "../lib/backend-const.gen.js";

type State = {
  input: {
    email: string;
    otp: string;
  };
  validation: {
    email: FormValidationResult;
    otp: FormValidationResult;
  };
};

export default function SignIn() {
  const form = new Form(["email", "otp"]);
  const [state, setState] = useState<State>({
    input: {
      email: "",
      otp: "",
    },
    validation: {
      email: null,
      otp: null,
    },
  });

  const onSubmitClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // prevent browser refresh
    const response = await fetch("/api/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form.getPayload(state.input)),
    });
    const validation = await response.json();
    if (response.status === 200 || response.status === 400) {
      if (form.isComplete(validation)) {
        // the user should now have an active session, so reload the page to
        // access the app
        window.location.replace("/");
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
          fieldId="email"
          validation={state.validation.email}
        >
          <input
            id="email"
            type="text"
            autoComplete="off"
            maxLength={USER_EMAIL_MAXLEN}
            onChange={(event) => onInputChange("email", event.target.value)}
            value={state.input.email}
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
          fieldId="otp"
          validation={state.validation.otp}
        >
          <input
            id="otp"
            type="text"
            autoComplete="off"
            maxLength={AUTH_OTP_LEN}
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
    <form className="unauth">
      <div className="row">Sign in to your account.</div>
      {renderEmailField()}
      {renderOTPField()}
      {renderNextButton()}
    </form>
  );
}
