import { exec } from "./db.js";
import { EMAIL_MAXLEN } from "./users.js";
import { OTP_TTL, genOTP, hashOTP } from "../auth.js";

const OTP_HASH_DIGEST_LEN = 40;

class OTPs {
  private static _schema = `
    CREATE TABLE otps (
      email VARCHAR(${EMAIL_MAXLEN}) PRIMARY KEY,
      otp CHAR(${OTP_HASH_DIGEST_LEN}) NOT NULL,
      expiry TIMESTAMP DEFAULT now() + interval '${OTP_TTL} seconds'
    )   
    `;

  /**
   * Generate a new OTP for the given email address, and return it.
   */
  async insert(email: string): Promise<string> {
    const otp = genOTP(process.env.OTP_SECRET!, email);
    const otpHash = hashOTP(process.env.OTP_SECRET!, email, otp);
    await exec(
      `
      INSERT INTO otps (email, otp)
      VALUES ($1, $2)
      ON CONFLICT (email) DO UPDATE SET otp = $2, expiry = DEFAULT
      `,
      [email, otpHash],
    );
    return otp;
  }

  /**
   * Return whether the OTP was valid and redeemed.
   */
  async select(otp: string, email: string): Promise<boolean> {
    const otpHash = hashOTP(process.env.OTP_SECRET!, email, otp);
    const result = await exec(
      `
      DELETE FROM otps
      WHERE email = $1 AND otp = $2 AND now() <= expiry
      `,
      [email, otpHash],
    );
    return result.rowCount === 1;
  }
}

export const otps = new OTPs();
