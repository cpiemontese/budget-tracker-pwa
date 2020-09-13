import get from "lodash.get";
import nodemailer from "nodemailer";
import nextConnect from "next-connect";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithTransporter,
  NextApiRequestWithLogger,
  User,
  NextApiRequestWithEnv,
} from "../../types";

import db from "../../middleware/database";
import logger from "../../middleware/logger";
import loadEnv from "../../middleware/load-env";
import transporter from "../../middleware/transporter";

const handler = nextConnect()
  .use(loadEnv)
  .use(db)
  .use(logger)
  .use(transporter)
  .post(authenticate);

async function authenticate(
  req: NextApiRequestWithDB &
    NextApiRequestWithEnv &
    NextApiRequestWithLogger &
    NextApiRequestWithTransporter,
  res: NextApiResponse
) {
  const email = get(req.body, ["email"], null) as string;
  const authenticationToken = get(
    req.body,
    ["authenticationToken"],
    null
  ) as string;

  if ([email, authenticationToken].some((value) => value === null)) {
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
      "/api/authenticate - user fetch error"
    );
    res.status(500).send({});
    return res;
  }

  if (user === null || user === undefined) {
    res.status(500).send({});
    return res;
  }

  const { authenticationToken: userauthenticationToken } = user;

  if (userauthenticationToken !== authenticationToken) {
    res.status(500).send({});
    return res;
  }

  try {
    req.usersCollection.updateOne({ email }, { authenticated: true });
  } catch (error) {
    req.logger.error(
      {
        error: error.message,
      },
      "/api/authenticate - user update error"
    );
    res.status(500).send({});
    return res;
  }

  const loginUrl = `https://${req.localEnv.app.host}/login?email=${email}`;
  try {
    const info = await req.transporter.sendMail({
      from: `"${req.localEnv.mailerName}" <${req.localEnv.smtp.user}>`,
      to: email,
      subject: `Successful verification!`,
      text: `Hi ${user.username}, thank you for verifying your account.\n\nLog in by clicking this link: ${loginUrl}`,
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
      "/api/authenticate - sendMail error"
    );
    res.status(500).send({});
    return res;
  }

  res.status(204).send({});
  return res;
}

export default handler;
export { authenticate };
