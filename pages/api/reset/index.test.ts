import { createMocks } from "node-mocks-http";
import Mail from "nodemailer/lib/mailer";

import { reset } from "./index";

import getEnv from "../../../lib/test-env";

const LOCAL_ENV = getEnv();

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

  req.localEnv = LOCAL_ENV;

  const response = await reset(req, res);

  expect(response.statusCode).toEqual(400);
});

test("returns 204 if user is not found", async () => {
  const { req, res } = createMocks({
    method: "POST",
    body: {
      email: "test@google.com",
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

  req.localEnv = LOCAL_ENV;

  const response = await reset(req, res);

  expect(response.statusCode).toEqual(204);
  expect(actualFilter).toEqual({ email: "test@google.com" });
});

test("returns 204 if user is not authenticated", async () => {
  const { req, res } = createMocks({
    method: "POST",
    body: {
      email: "test@google.com",
    },
  });

  let actualFilter = null;
  req.usersCollection = {
    async findOne(filter) {
      actualFilter = filter;
      return { authenticated: false };
    },
  };

  req.transporter = {
    async sendMail() {},
  };

  req.logger = {
    debug() {},
    error() {},
  };

  req.localEnv = LOCAL_ENV;

  const response = await reset(req, res);

  expect(response.statusCode).toEqual(204);
  expect(actualFilter).toEqual({ email: "test@google.com" });
});

test("set token", async () => {
  const email = "test@google.com";
  const username = "Tester";

  const { req, res } = createMocks({
    method: "POST",
    body: {
      email,
    },
  });

  let updateOneArgs = null;
  req.usersCollection = {
    async findOne() {
      return { authenticated: true, email, username };
    },
    async updateOne(filter, update) {
      updateOneArgs = {
        filter,
        update,
      };
      return null;
    },
  };

  let transporterArgs = null;
  req.transporter = {
    async sendMail({ from, to, subject }) {
      transporterArgs = {
        from,
        to,
        subject,
      };
    },
  };

  req.logger = {
    debug() {},
    error() {},
  };

  req.localEnv = LOCAL_ENV;

  const response = await reset(req, res);

  expect(response.statusCode).toEqual(204);
  expect(updateOneArgs.filter).toEqual({
    email,
  });
  expect(updateOneArgs.update).toHaveProperty("resetToken.value");
  expect(updateOneArgs.update).toHaveProperty("resetToken.expiration");

  expect(transporterArgs.from).toMatch(RegExp(`${LOCAL_ENV.mailerName}`));
  expect(transporterArgs.from).toMatch(RegExp(`${LOCAL_ENV.smtp.user}`));
  expect(transporterArgs.to).toMatch(email);
  expect(transporterArgs.subject).toMatch("reset token");
});
