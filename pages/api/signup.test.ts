import { createMocks } from "node-mocks-http";
import { signup } from "./signup";
import { compare } from "bcrypt";
import Mail from "nodemailer/lib/mailer";

type UserDoc = {
  email: string;
  username: string;
  password: string;
  verified: boolean;
  verificationSecret: string;
};

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

  const response = await signup(req, res);

  expect(response.statusCode).toEqual(400);
});

test("returns 500 if user is already registered", async () => {
  const { req, res } = createMocks({
    method: "POST",
    body: {
      email: "test@google.com",
      username: "Tester",
      password: "T3st1ng",
    },
  });

  let actualFilter = null;
  req.usersCollection = {
    async findOne(filter) {
      actualFilter = filter;
      return { email: "test@google.com" };
    },
  };

  req.transporter = {
    async sendMail() {},
  };

  req.logger = {
    debug() {},
    error() {},
  };

  const response = await signup(req, res);

  expect(response.statusCode).toEqual(500);
  expect(actualFilter).toEqual({ email: "test@google.com" });
});

test("returns 204 if user is correctly created", async () => {
  const plaintextPassword = "T3st1ng";
  const email = "test@google.com";
  const username = "Tester";

  const { req, res } = createMocks({
    method: "POST",
    body: {
      email,
      username,
      password: plaintextPassword,
    },
  });

  let actualUserDoc: UserDoc = null;
  req.usersCollection = {
    async findOne() {
      return null;
    },
    async insertOne(userDoc: UserDoc) {
      actualUserDoc = userDoc;
      return "mongodb_id";
    },
  };

  req.transporter = {
    async sendMail() {},
  };

  req.logger = {
    debug() {},
    error() {},
  };

  const response = await signup(req, res);

  expect(response.statusCode).toEqual(204);
  expect(actualUserDoc).toMatchObject({
    email,
    username,
    verified: false,
  });

  expect(await compare(plaintextPassword, actualUserDoc.password)).toBe(true);
});

test("returns 204 and sends mail if user is correctly created", async () => {
  const plaintextPassword = "T3st1ng";
  const email = "test@google.com";
  const username = "Tester";

  const { req, res } = createMocks({
    method: "POST",
    body: {
      email,
      username,
      password: plaintextPassword,
    },
  });

  let interceptedVerificationSecret: string = null;
  req.usersCollection = {
    async findOne() {
      return null;
    },
    async insertOne(userDoc: UserDoc) {
      interceptedVerificationSecret = userDoc.verificationSecret;
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

  const response = await signup(req, res);

  expect(response.statusCode).toEqual(204);

  expect(actualMail.from).toMatch(process.env.MAILER_NAME);
  expect(actualMail.from).toMatch(process.env.SMTP_USER);

  expect(actualMail.to).toMatch(email);

  expect(actualMail.subject).toMatch(process.env.APP_NAME);

  expect(actualMail.text).toMatch(username);
  expect(actualMail.text).toMatch(process.env.APP_HOST);
  expect(actualMail.text).toMatch(interceptedVerificationSecret);
});
