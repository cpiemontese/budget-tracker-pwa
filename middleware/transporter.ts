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
  req.transporter =
    process.env.NODE_ENV === "development"
      ? await getTestTransporter()
      : mailTransporter;

  next();
}

async function getTestTransporter() {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

const middleware = nextConnect();

middleware.use(transporter);

export default middleware;
