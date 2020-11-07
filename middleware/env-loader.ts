import nextConnect, { NextHandler } from "next-connect";
import { NextApiRequestWithEnv } from "../types";
import { NextApiResponse } from "next";

const middleware = nextConnect();
middleware.use(envLoader);
export default middleware;

function envLoader(
  req: NextApiRequestWithEnv,
  _res: NextApiResponse,
  next: NextHandler
) {
  req.localEnv = {
    app: {
      name: process.env.APP_NAME,
      host:
        process.env.NODE_ENV === "production"
          ? process.env.NOW_URL
          : process.env.APP_HOST,
    },
    db: {
      uri: process.env.MONGODB_URI,
      name: process.env.DB_NAME,
      maxIdlePeriod: parseInt(process.env.DB_MAX_IDLE_PERIOD),
      collections: {
        users: process.env.DB_USERS_COLLECTION,
      },
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
  return next();
}
