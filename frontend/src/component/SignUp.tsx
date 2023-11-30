import React from "react";

export default function SignUp() {
  return (
    <div className="unauth-form">
      <div className="row">Create a new account.</div>
      <div className="row">
        <div>Enter your email:</div>
        <input type="text"></input>
      </div>
      <div className="row">
        <div>Enter your name:</div>
        <input type="text"></input>
      </div>
      <div className="row">
        <div>Enter the code sent to your email:</div>
        <input type="text"></input>
      </div>
      <div className="row submit">
        <button>Create account</button>
      </div>
    </div>
  );
}
