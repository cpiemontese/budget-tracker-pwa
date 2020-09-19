import get from "lodash.get";
import nodemailer from "nodemailer";
import nextConnect from "next-connect";

import { hash } from "bcrypt";
import { randomBytes } from "crypto";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  User,
  NextApiRequestWithEnv,
  NextApiRequestWithTransporter,
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
  .post(reset);

export default handler;
export { reset };

const SALT_ROUNDS = 12;
const RESET_TOKEN_LENGTH = 16;

async function reset(
  req: NextApiRequestWithDB &
    NextApiRequestWithLogger &
    NextApiRequestWithEnv &
    NextApiRequestWithTransporter,
  res: NextApiResponse
) {
  const email = get(req.body, ["email"], null) as string;
  const resetToken = get(req.body, ["token"], null) as string;
  const plainTextPassword = get(req.body, ["password"], null) as string;

  if (email === null) {
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
      "/api/reset - user fetch error"
    );
    res.status(204).send({});
    return res;
  }

  if (user === null || user === undefined) {
    res.status(204).send({});
    return res;
  }

  const { authenticated } = user;

  if (!authenticated) {
    res.status(204).send({});
    return res;
  }

  if (resetToken === null || plainTextPassword === null) {
    // this is a request for a token
    // we must generate and send the token to the user email
    const resetToken = randomBytes(RESET_TOKEN_LENGTH).toString("hex");

    try {
      req.usersCollection.updateOne(
        {
          email,
        },
        {
          resetToken: {
            value: resetToken,
            expiration: Date.now() + req.localEnv.resetTokenMaxAge,
          },
        }
      );
    } catch (error) {
      req.logger.error(
        {
          error: error.message,
        },
        "/api/reset - user update error"
      );
      res.status(500).send({});
      return res;
    }

    const { username } = user;

    const resetUrl = `https://${req.localEnv.app.host}/reset?email=${email}&token=${resetToken}`;
    try {
      const info = await req.transporter.sendMail({
        from: `"${req.localEnv.mailerName}" <${req.localEnv.smtp.user}>`,
        to: email,
        subject: `${req.localEnv.app.name} Signup!`,
        text: `Hi ${username}, thank you for signing up to ${req.localEnv.app.name}.\n\nPlease verify your account by clicking this link: ${resetUrl}`,
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
        "/api/reset - sendMail error"
      );
      res.status(500).send({});
      return res;
    }

    res.status(204).send({});
    return res;
  } else {
    // this is an actual reset request
    // we must verify the token, set the new password and send a confirmation email
    const { resetToken: userResetToken } = user;

    const tokenMatches = resetToken === userResetToken.value;
    const tokenIsExpired = Date.now() > userResetToken.expiration;

    if (!tokenMatches || tokenIsExpired) {
      res.status(401).send({});
      return res;
    }

    try {
      req.usersCollection.updateOne(
        {
          email,
        },
        {
          password: await hash(plainTextPassword, SALT_ROUNDS),
        }
      );
    } catch (error) {
      req.logger.error(
        {
          error: error.message,
        },
        "/api/reset - user password update error"
      );
      res.status(500).send({});
      return res;
    }

    const { username } = user;

    try {
      const info = await req.transporter.sendMail({
        from: `"${req.localEnv.mailerName}" <${req.localEnv.smtp.user}>`,
        to: email,
        subject: `${req.localEnv.app.name} password reset successful`,
        text: `Hi ${username}, your password has been reset correctly.\n\nIf you wish to login you can access this link https://${req.localEnv.app.host}/login?email=${email}/`,
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
        "/api/reset - sendMail error"
      );
      res.status(500).send({});
      return res;
    }

    res.status(204).send({});
    return res;
  }
}
