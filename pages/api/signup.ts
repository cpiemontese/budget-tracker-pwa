import get from "lodash.get";
import nodemailer from "nodemailer";
import nextConnect from "next-connect";
import { NextApiResponse } from "next";
import { hash } from "bcrypt";

import {
  NextApiRequestWithDB,
  NextApiRequestWithTransporter,
  NextApiRequestWithLogger,
  NextApiRequestWithEnv,
  User,
} from "../../types";

import db from "../../middleware/database";
import logger from "../../middleware/logger";
import loadEnv from "../../middleware/load-env";
import transporter from "../../middleware/transporter";
import { randomBytes } from "crypto";

const SALT_ROUNDS = 12;
const VERIFICATION_SECRET_LENGTH = 16;

const handler = nextConnect()
  .use(loadEnv)
  .use(db)
  .use(logger)
  .use(transporter)
  .post(signup);

async function signup(
  req: NextApiRequestWithDB &
    NextApiRequestWithTransporter &
    NextApiRequestWithLogger &
    NextApiRequestWithEnv,
  res: NextApiResponse
) {
  const email = get(req.body, ["email"], null) as string;
  const username = get(req.body, ["username"], null) as string;
  const password = get(req.body, ["password"], null) as string;

  if ([email, username, password].some((value) => value === null)) {
    res.status(400).send({});
    return res;
  }

  let user: User = null;
  try {
    user = await req.usersCollection.findOne({ email });
  } catch (error) {
    req.logger.error(
      {
        error: error.message,
      },
      "/api/signup - user fetch error"
    );
    res.status(500).send({});
    return res;
  }

  if (user !== null && user !== undefined) {
    res.status(500).send({});
    return res;
  }

  const authenticationToken = randomBytes(VERIFICATION_SECRET_LENGTH).toString(
    "hex"
  );

  try {
    await req.usersCollection.insertOne({
      email,
      username,
      password: await hash(password, SALT_ROUNDS),
      authenticated: false,
      authenticationToken,
      funds: [],
      budgetItems: [],
    });
  } catch (error) {
    req.logger.error(
      {
        error: error.message,
      },
      "/api/signup - user insert error"
    );
    res.status(500).send({});
    return res;
  }

  const authenticationUrl = `https://${req.localEnv.app.host}/authenticate?email=${email}&token=${authenticationToken}`;
  try {
    const info = await req.transporter.sendMail({
      from: `"${req.localEnv.mailerName}" <${req.localEnv.smtp.user}>`,
      to: email,
      subject: `${req.localEnv.app.name} Signup!`,
      text: `Hi ${username}, thank you for signing up to ${req.localEnv.app.name}.\n\nPlease verify your account by clicking this link: ${authenticationUrl}`,
    });

    if (process.env.NODE_ENV === "development") {
      req.logger.debug({
        messageId: info.messageId,
        previewURL: nodemailer.getTestMessageUrl(info),
      });
    }
  } catch (error) {
    req.logger.error(
      {
        error: error.message,
      },
      "/api/signup - sendMail error"
    );
    res.status(500).send({});
    return res;
  }

  res.status(204).send({});
  return res;
}

export default handler;
export { signup };
