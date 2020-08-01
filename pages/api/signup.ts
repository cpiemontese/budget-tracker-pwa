import nextConnect from "next-connect";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithTransporter,
  NextApiRequestWithLogger,
} from "../../types";

import db from "../../middleware/database";
import logger from "../../middleware/logger";
import transporter from "../../middleware/transporter";

const handler = nextConnect();

handler.use(db);
handler.use(logger);
handler.use(transporter);

handler.post(
  async (
    req: NextApiRequestWithDB &
      NextApiRequestWithTransporter &
      NextApiRequestWithLogger,
    res: NextApiResponse
  ) => {
    const { email, username, password } = req.body as {
      email: string;
      username: string;
      password: string;
    };

    try {
      await req.transporter.sendMail({
        from: `"${process.env.MAILER_NAME}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `${process.env.APP_NAME} Signup!`,
        text: `Hi ${username}, your password is ${password}`,
      });
    } catch (error) {
      req.logger.error(
        {
          error: error.message,
        },
        "/api/signup - sendMail error"
      );
      res.status(500).send({});
    }

    return res.status(204).send({});
  }
);

export default handler;
