import { createMocks } from "node-mocks-http";
import { compare } from "bcrypt";
import Mail from "nodemailer/lib/mailer";

import { verify } from "./verify";
import { User } from "../../types";

test("returns 400 if body is not as expected", async () => {
  const { req, res } = createMocks({
    method: "POST",
    body: null,
  });

  req.transporter = {
    async sendMail() {},
  };

  req.logger = {
    debug() {},
    error() {},
  };

  const response = await verify(req, res);

  expect(response.statusCode).toEqual(400);
});

test("returns 500 if user is not found", async () => {
  const { req, res } = createMocks({
    method: "POST",
    body: {
      email: "test@google.com",
      verificationToken: "token",
    },
  });

  let actualFilter = null;
  req.usersCollection = {
    async findOne(filter) {
      actualFilter = filter;
      return null;
    },
  };

  req.transporter = {
    async sendMail() {},
  };

  req.logger = {
    debug() {},
    error() {},
  };

  const response = await verify(req, res);

  expect(response.statusCode).toEqual(500);
  expect(actualFilter).toEqual({ email: "test@google.com" });
});

test("returns 500 if verification token does not match", async () => {
  const email = "test@google.com";
  const verificationToken = "token";

  const { req, res } = createMocks({
    method: "POST",
    body: {
      email,
      verificationToken,
    },
  });

  req.usersCollection = {
    async findOne() {
      return { email, verificationToken: "token that does not match" };
    },
  };

  req.transporter = {
    async sendMail() {},
  };

  req.logger = {
    debug() {},
    error() {},
  };

  const response = await verify(req, res);

  expect(response.statusCode).toEqual(500);
});

test("returns 204 if token matches, user is updated and mail is sent", async () => {
  const email = "test@google.com";
  const username = "Tester";
  const verificationToken = "token";

  const { req, res } = createMocks({
    method: "POST",
    body: {
      email,
      verificationToken,
    },
  });

  let verifiedUpdate = null;
  req.usersCollection = {
    async findOne() {
      return { email, username, verificationToken };
    },
    async updateOne(_, update: { verified: boolean }) {
      verifiedUpdate = update.verified;
      return "mongodb_id";
    },
  };

  let actualMail: Mail.Options = null;
  req.transporter = {
    async sendMail(mailOptions: Mail.Options) {
      actualMail = mailOptions;
      return { messageId: "some_id" };
    },
  };

  req.logger = {
    debug() {},
    error() {},
  };

  const response = await verify(req, res);

  expect(response.statusCode).toEqual(204);

  expect(verifiedUpdate).toBe(true);

  expect(actualMail.from).toMatch(process.env.MAILER_NAME);
  expect(actualMail.from).toMatch(process.env.SMTP_USER);

  expect(actualMail.to).toMatch(email);

  expect(actualMail.subject).toMatch("Successful verification!");

  expect(actualMail.text).toMatch(username);
  expect(actualMail.text).toMatch(process.env.APP_HOST);
  expect(actualMail.text).toMatch("login");
  expect(actualMail.text).toMatch(email);
});
