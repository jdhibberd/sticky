import React, { useState } from "react";
import FormField from "./FormField.js";

type State = {
  email: string;
  name: string;
  otp: string;
};

export default function SignUp() {
  const [state, setState] = useState<State>({
    email: "",
    name: "",
    otp: "",
  });

  const onEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState) => {
      return { ...prevState, email: event.target.value };
    });
  };

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState) => {
      return { ...prevState, name: event.target.value };
    });
  };

  const onOTPChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState) => {
      return { ...prevState, otp: event.target.value };
    });
  };

  return (
    <div className="unauth-form">
      <div className="row">Create a new account.</div>
      <div className="row">
        <FormField label={"Enter your email:"} validation={true}>
          <input
            name="email"
            type="text"
            autoComplete="email"
            onChange={onEmailChange}
            value={state.email}
          ></input>
        </FormField>
      </div>
      <div className="row">
        <FormField label={"Enter your name:"} validation="Not a valid age.">
          <input
            name="name"
            autoComplete="given-name"
            type="text"
            onChange={onNameChange}
            value={state.name}
          ></input>
        </FormField>
      </div>
      <div className="row">
        <FormField label={"Enter the code sent to your email:"}>
          <input
            name="otp"
            type="text"
            onChange={onOTPChange}
            value={state.otp}
          ></input>
        </FormField>
      </div>
      <div className="row submit">
        <button>Create account</button>
      </div>
    </div>
  );
}
