import { LocalEnv } from "../types";

export default function env(): LocalEnv {
  return {
    app: {
      name: process.env.APP_NAME,
      host: process.env.APP_HOST,
    },
    db: {
      uri: process.env.MONGODB_URI,
      name: process.env.DB_NAME,
      collections: {
        users: process.env.USERS_COLLECTION,
      }
    },
    logLevel: process.env.LOG_LEVEL,
    smtp: {
      host: process.env.SMTP_HOST,
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
    },
    mailerName: process.env.MAILER_NAME,
    loginCookie: {
      name: process.env.LOGIN_COOKIE_NAME,
      maxAge: parseInt(process.env.LOGIN_COOKIE_MAX_AGE),
    },
    resetTokenMaxAge: parseInt(process.env.RESET_TOKEN_MAX_AGE),
  };
}
