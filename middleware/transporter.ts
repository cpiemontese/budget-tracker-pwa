import nextConnect, { NextHandler } from "next-connect";
import { NextApiRequestWithTransporter } from "../types";
import { NextApiResponse } from "next";
import nodemailer from "nodemailer";

const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function transporter(
  req: NextApiRequestWithTransporter,
  _res: NextApiResponse,
  next: NextHandler
) {
  if (process.env.NODE_ENV === "development") {
    const testAccount = await nodemailer.createTestAccount();
    req.transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return next();
  }

  req.transporter = mailTransporter;
  next();
}

const middleware = nextConnect();

middleware.use(transporter);

export default middleware;
