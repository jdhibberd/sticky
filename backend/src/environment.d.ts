declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /**
       * App name.
       */
      APP_NAME: string;

      /**
       * The post the app should listen on.
       */
      PORT: number;

      /**
       * Config for connecting to the Postgres database.
       */
      DB_HOST: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_NAME: string;

      /**
       * Secret keys for securely generating cookies and OTPs.
       *
       * See `auth` module for generating these keys.
       */
      COOKIE_SECRET: string;
      OTP_SECRET: string;

      /**
       * AWS credentials.
       *
       * Each app should have its own IAM policy, which for local development is
       * attached to an IAM User whose credentials are included here, but in
       * production is attached to an IAM Role which is associated with the ECS
       * cluster.
       */
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
    }
  }
}

export {};
