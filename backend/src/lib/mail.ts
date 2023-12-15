/**
 * Helpers for sending email.
 *
 * Email is sent using AWS SES.
 */

import ses, { SESClient } from "@aws-sdk/client-ses";
import nodemailer from "nodemailer";

const SES_REGION = "us-west-2";

/**
 * Send an email.
 */
export async function sendEmail(
  from: string,
  to: string,
  subject: string,
  text: string,
): Promise<void> {
  const client = new SESClient({
    region: SES_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  const transport = nodemailer.createTransport({
    SES: { ses: client, aws: ses },
  });
  await transport.sendMail({ from, to, subject, text });
}
