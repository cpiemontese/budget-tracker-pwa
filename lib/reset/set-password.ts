import nodemailer from "nodemailer";

import { hash } from "bcrypt";
import { Logger } from "pino";
import { Collection } from "mongodb";
import { Transporter } from "nodemailer";

import { LocalEnv, User } from "../../types";

const SALT_ROUNDS = 12;

export async function setPassword(
  resetToken: string,
  plainTextPassword: string,
  user: User,
  localEnv: LocalEnv,
  usersCollection: Collection,
  transporter: Transporter,
  logger: Logger
) {
  const { resetToken: userResetToken, email } = user;

  const tokenMatches = resetToken === userResetToken.value;
  const tokenIsExpired = Date.now() > userResetToken.expiration;

  if (!tokenMatches || tokenIsExpired) {
    return 401;
  }

  try {
    await usersCollection.updateOne(
      {
        email,
      },
      {
        password: await hash(plainTextPassword, SALT_ROUNDS),
      }
    );
  } catch (error) {
    logger.error(
      {
        error: error.message,
      },
      "/api/reset - user password update error"
    );

    return 500;
  }

  const { username } = user;

  try {
    const info = await transporter.sendMail({
      from: `"${localEnv.mailerName}" <${localEnv.smtp.user}>`,
      to: email,
      subject: `${localEnv.app.name} password reset successful`,
      text: `Hi ${username}, your password has been reset correctly.\n\nIf you wish to login you can access this link https://${localEnv.app.host}/login?email=${email}/`,
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
