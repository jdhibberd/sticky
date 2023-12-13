/**
 * A form field that can display the outcome of validation.
 */

import React from "react";
import Tick from "./symbol/Tick.js";
import Cross from "./symbol/Cross.js";
import { type FormValidationResult } from "@/backend/validation.js";

type Props = {
  label: string;
  fieldId: string;
  children: React.ReactElement;
  validation?: FormValidationResult;
};

export default function FormField({
  label,
  fieldId,
  validation = null,
  children,
}: Props) {
  const renderValidationSymbol = () => {
    if (validation === null) {
      return null;
    }
    return validation === true ? <Tick /> : <Cross />;
  };

  const renderValidationError = () => {
    if (validation !== true && validation !== null) {
      return <div className="error">{validation}</div>;
    }
  };

  return (
    <div className="form-field">
      <label htmlFor={fieldId}>{label}</label>
      <div className="value">
        <div className="input">{children}</div>
        <div className="validation">{renderValidationSymbol()}</div>
      </div>
      {renderValidationError()}
    </div>
  );
}
