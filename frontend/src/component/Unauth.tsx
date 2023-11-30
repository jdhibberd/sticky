import React from "react";
import SignIn from "./SignIn.js";
import SignUp from "./SignUp.js";

export default function Unauth() {
  return (
    <div className="unauth-page">
      <div className="grid-item-a">
        <h1>Sticky</h1>
      </div>
      <div className="grid-item-b">
        <h2>Organise together with collaborative sticky notes.</h2>
      </div>
      <div className="grid-item-c">
        <SignIn />
      </div>
      <div className="grid-item-d">
        <SignUp />
      </div>
      <div className="grid-item-e">hemingroth &copy; 2023</div>
    </div>
  );
}
