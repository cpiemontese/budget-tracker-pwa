import nodemailer, { Transporter } from "nodemailer";

import { Logger } from "pino";
import { Collection } from "mongodb";
import { randomBytes } from "crypto";

import { LocalEnv, User } from "../../types";

const RESET_TOKEN_LENGTH = 16;

export async function setToken(
  user: User,
  localEnv: LocalEnv,
  usersCollection: Collection,
  transporter: Transporter,
  logger: Logger
) {
  const { email } = user;

  const resetToken = randomBytes(RESET_TOKEN_LENGTH).toString("hex");

  try {
    await usersCollection.updateOne(
      {
        email,
      },
      {
        resetToken: {
          value: resetToken,
          expiration: Date.now() + localEnv.resetTokenMaxAge,
        },
      }
    );
  } catch (error) {
    logger.error(
      {
        error: error.message,
      },
      "/api/reset - user update error"
    );
    return 500;
  }

  const { username } = user;

  const resetUrl = `https://${localEnv.app.host}/reset?email=${email}&token=${resetToken}`;
  try {
    const info = await transporter.sendMail({
      from: `"${localEnv.mailerName}" <${localEnv.smtp.user}>`,
      to: email,
      subject: `${localEnv.app.name} reset token`,
      text: `Hi ${username}, if you have requested a password reset here's your link: ${resetUrl}\n\nIf you didn't request a password reset, you can just ignore this email: your account is safe.`,
    });

    if (process.env.NODE_ENV === "development") {
      logger.debug({
        messageId: info.messageId,
        previewURL: nodemailer.getTestMessageUrl(info),
      });
    }
  } catch (error) {
    logger.error(
      {
        error: error.message,
      },
      "/api/reset - sendMail error"
    );
    return 500;
  }

  return 204;
}
