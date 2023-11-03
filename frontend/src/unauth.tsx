import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import Unauth from "./component/Unauth.js";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <Unauth />
  </StrictMode>,
);
