import { Router, Response } from "express";
import {
  BadRequestError,
  type FormValidationResponse,
  buildFormValidationResponse,
  checkEmail,
  checkOTP,
  checkProps,
  checkString,
} from "../../../validation.js";
import { otps } from "../../../entity/otp.js";
import { NAME_MAXLEN, NAME_MINLEN, users } from "../../../entity/users.js";
import { emailOTP, newSession } from "../../../auth.js";

type RawPayload = { [k: string]: unknown };
type Payload = {
  name: string | null;
  email: string | null;
  otp: string | null;
};

export default Router().post("/auth/signup", async (req, res, next) => {
  try {
    const error = await checkRequest(req.body);
    const { name, email, otp }: Payload = req.body;
    const response = buildFormValidationResponse(
      ["name", "email", "otp"],
      [name, email, otp],
      error,
    );
    if (error === undefined) {
      res.status(200);
      if (isFormPendingEmailVerification(response)) await sendOTP(email!);
      if (isFormComplete(response)) await createAccount(res, name!, email!);
    } else {
      res.status(400);
    }
    res.json(response);
  } catch (e) {
    next(e);
  }
});

async function checkRequest(
  payload: RawPayload,
): Promise<BadRequestError | undefined> {
  checkProps("/", payload, ["name", "email", "otp"]);
  try {
    checkString("/name", payload.name, {
      minLength: NAME_MINLEN,
      maxLength: NAME_MAXLEN,
      optional: true,
    });
    await checkEmail("/email", payload.email, { exists: false });
    await checkOTP("/otp", payload.otp, payload.email as string);
  } catch (e) {
    if (e instanceof BadRequestError) {
      return e;
    } else {
      throw e;
    }
  }
}

function isFormPendingEmailVerification({
  name,
  email,
  otp,
}: FormValidationResponse): boolean {
  return name === true && email === true && otp === null;
}

function isFormComplete({ name, email, otp }: FormValidationResponse): boolean {
  return name === true && email === true && otp === true;
}

async function sendOTP(email: string): Promise<void> {
  const otp = await otps.insert(email);
  await emailOTP(email, otp);
}

async function createAccount(
  res: Response,
  name: string,
  email: string,
): Promise<void> {
  const userId = await users.insert(name, email);
  await newSession(res, userId);
}
