import get from "lodash.get";
import nodemailer from "nodemailer";
import nextConnect from "next-connect";
import { NextApiResponse } from "next";
import { hash } from "bcrypt";

import {
  NextApiRequestWithDB,
  NextApiRequestWithTransporter,
  NextApiRequestWithLogger,
} from "../../types";

import db from "../../middleware/database";
import logger from "../../middleware/logger";
import transporter from "../../middleware/transporter";

const SALT_ROUNDS = 12;

const handler = nextConnect();

handler.use(db);
handler.use(logger);
handler.use(transporter);

handler.post(signup);

async function signup(
  req: NextApiRequestWithDB &
    NextApiRequestWithTransporter &
    NextApiRequestWithLogger,
  res: NextApiResponse
) {
  const email = get(req.body, ["email"], null) as string;
  const username = get(req.body, ["username"], null) as string;
  const password = get(req.body, ["password"], null) as string;

  if ([email, username, password].some((value) => value === null)) {
    res.status(400).send({});
    return res;
  }

  let user = null;
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

  try {
    req.usersCollection.insertOne({
      email,
      username,
      password: await hash(password, SALT_ROUNDS),
      authenticated: false,
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

  try {
    const info = await req.transporter.sendMail({
      from: `"${process.env.MAILER_NAME}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `${process.env.APP_NAME} Signup!`,
      text: `Hi ${username}, your password is ${password}`,
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
