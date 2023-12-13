import { Router, Response } from "express";
import {
  BadRequestError,
  type FormValidationResponse,
  buildFormValidationResponse,
  checkEmail,
  checkOTP,
  checkProps,
} from "../../../validation.js";
import { otps } from "../../../entity/otp.js";
import { users } from "../../../entity/users.js";
import { newSession } from "../../../auth.js";

type RawPayload = { [k: string]: unknown };
type Payload = {
  email: string | null;
  otp: string | null;
};

export default Router().post("/api/signin", async (req, res, next) => {
  try {
    const error = await checkRequest(req.body);
    const { email, otp }: Payload = req.body;
    const response = buildFormValidationResponse(
      ["email", "otp"],
      [email, otp],
      error,
    );
    if (error === undefined) {
      res.status(200);
      if (isFormPendingEmailVerification(response)) await sendOTP(email!);
      if (isFormComplete(response)) await createSession(res, email!);
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
  checkProps("/", payload, ["email", "otp"]);
  try {
    await checkEmail("/email", payload.email, { exists: true });
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
  email,
  otp,
}: FormValidationResponse): boolean {
  return email === true && otp === null;
}

function isFormComplete({ email, otp }: FormValidationResponse): boolean {
  return email === true && otp === true;
}

async function sendOTP(email: string): Promise<void> {
  const test = await otps.insert(email);
  console.log(test); // TODO replace w/ email
}

async function createSession(res: Response, email: string): Promise<void> {
  const user = await users.selectByEmail(email);
  if (user === null) throw new Error("Email not found.");
  await newSession(res, user.id);
}
