import React from "react";
import Tick from "./symbol/Tick.js";
import Cross from "./symbol/Cross.js";

type Props = {
  label: string;
  children: React.ReactElement;
  // - `true` indicates that the field has been validated and passed
  // - `null` indicates that the field has not yet been validated
  // - a string value indicates that the field has been validated and failed,
  //   and the reason for the failure is the contents of the string
  validation?: true | string | null;
};

export default function FormField({
  label,
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
      <div>{label}</div>
      <div className="value">
        <div className="input">{children}</div>
        <div className="validation">{renderValidationSymbol()}</div>
      </div>
      {renderValidationError()}
    </div>
  );
}
