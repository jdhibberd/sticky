import { type FormValidationResponse } from "@/backend/validation.js";

type FormInput = { [k: string]: string };
type FormPayload = { [k: string]: string | null };

/**
 * Helper class for managing form validation.
 */
export class Form {
  constructor(private orderedFields: string[]) {}

  /**
   * Return whether all form fields have been successfully validated.
   */
  isComplete(validation: FormValidationResponse): boolean {
    return this.orderedFields.every((k) => validation[k] === true);
  }

  /**
   * Return whether a form field should be visible, given the validation
   * statuses of the form's other fields.
   *
   * Forms are completed incrementally, with a field only being visible for the
   * user to complete once all prior fields have been successfully validated.
   */
  isFieldVisible(field: string, validation: FormValidationResponse): boolean {
    const i = this.orderedFields.indexOf(field);
    return validation[this.orderedFields[i - 1]] === true;
  }

  /**
   * Return an object that contains all the form field values, in preparing for
   * it being sent to the server for validation.
   *
   * Empty strings are replaced with null values to indicate incomplete fields.
   */
  getPayload(input: FormInput): FormPayload {
    return Object.fromEntries(
      this.orderedFields.map((f) => [f, input[f].trim() || null]),
    );
  }

  /**
   * Return an updated copy of a form's local state to reflect validation data
   * received from the client.
   *
   * All fields that occur after either an invalid or incomplete field are
   * reset, to support the concept of completing the form iteratively from top
   * to bottom.
   */
  updateInputState<T extends FormInput>(
    input: T,
    validation: FormValidationResponse,
  ): T {
    let skipRest = false;
    return Object.fromEntries(
      this.orderedFields.map((f) => {
        if (skipRest === true) return [f, ""];
        if (validation[f] !== true) {
          skipRest = true;
        }
        return [f, input[f]];
      }),
    ) as T;
  }
}
