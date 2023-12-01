import { Router } from "express";
import {
  BadRequestError,
  buildFormValidationResponse,
  checkProps,
  checkString,
} from "../../../validation.js";

export default Router().post("/api/signup", async (req, res, next) => {
  try {
    checkRequest(req.body);
    let email, name, otp;
    let error;
    try {
      email = checkEmail(req.body.email);
      name = checkName(req.body.name);
      otp = checkOTP(req.body.otp);
    } catch (e) {
      if (e instanceof BadRequestError) {
        error = e;
      } else {
        throw e;
      }
    }
    res.status(error === undefined ? 200 : 400);
    res.json(
      buildFormValidationResponse(
        ["email", "name", "otp"],
        [email, name, otp],
        error,
      ),
    );
  } catch (e) {
    next(e);
  }
});

function checkRequest(payload: { [k: string]: unknown }): void {
  checkProps("/", payload, ["email", "name", "otp"]);
}

function checkEmail(v: unknown): string | null {
  checkString("/email", v, {
    minLength: 2,
    maxLength: 30,
    optional: true,
  });
  return v as string | null;
}

function checkName(v: unknown): string | null {
  checkString("/name", v, {
    minLength: 1,
    maxLength: 5,
    optional: true,
  });
  return v as string | null;
}

function checkOTP(v: unknown): string | null {
  checkString("/otp", v, {
    minLength: 6,
    maxLength: 6,
    optional: true,
  });
  return v as string | null;
}
