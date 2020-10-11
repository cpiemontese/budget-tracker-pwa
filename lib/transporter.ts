import nodemailer from "nodemailer";
import env from "./env";

const localEnv = env();

const mailTransporter = nodemailer.createTransport({
  host: localEnv.smtp.host,
  port: 587,
  secure: false,
  auth: {
    user: localEnv.smtp.user,
    pass: localEnv.smtp.password,
  },
});

export default async function transporter() {
    return localEnv.logLevel === "development"
      ? await getTestTransporter()
      : mailTransporter;
}

export async function getTestTransporter() {
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