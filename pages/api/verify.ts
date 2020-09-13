import get from "lodash.get";
import nodemailer from "nodemailer";
import nextConnect from "next-connect";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithTransporter,
  NextApiRequestWithLogger,
  User,
} from "../../types";

import db from "../../middleware/database";
import logger from "../../middleware/logger";
import transporter from "../../middleware/transporter";

const handler = nextConnect();

handler.use(db);
handler.use(logger);
handler.use(transporter);

handler.post(verify);

async function verify(
  req: NextApiRequestWithDB &
    NextApiRequestWithLogger &
    NextApiRequestWithTransporter,
  res: NextApiResponse
) {
  const email = get(req.body, ["email"], null) as string;
  const verificationToken = get(
    req.body,
    ["verificationToken"],
    null
  ) as string;

  if ([email, verificationToken].some((value) => value === null)) {
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
      "/api/verify - user fetch error"
    );
    res.status(500).send({});
    return res;
  }

  if (user === null || user === undefined) {
    res.status(500).send({});
    return res;
  }

  const { verificationToken: userVerificationToken } = user;

  if (userVerificationToken !== verificationToken) {
    res.status(500).send({});
    return res;
  }

  try {
    req.usersCollection.updateOne({ email }, { verified: true });
  } catch (error) {
    req.logger.error(
      {
        error: error.message,
      },
      "/api/verify - user update error"
    );
    res.status(500).send({});
    return res;
  }

  const loginUrl = `https://${process.env.APP_HOST}/login?email=${email}`;
  try {
    const info = await req.transporter.sendMail({
      from: `"${process.env.MAILER_NAME}" <${process.env.SMTP_USER}>`,
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
      "/api/verify - sendMail error"
    );
    res.status(500).send({});
    return res;
  }

  res.status(204).send({});
  return res;
}

export default handler;
export { verify };
