import { createMocks } from "node-mocks-http";
import { hash } from "bcrypt";
import { parse } from "cookie";

import { login } from "./login";

import getEnv from "../../lib/test-env";

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

  const response = await login(req, res);

  expect(response.statusCode).toEqual(400);
});

test("returns 500 if user is not found", async () => {
  const { req, res } = createMocks({
    method: "POST",
    body: {
      email: "test@google.com",
      password: "pwd",
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

  const response = await login(req, res);

  expect(response.statusCode).toEqual(500);
  expect(actualFilter).toEqual({ email: "test@google.com" });
});

test("returns 500 if password does not match (authenticated user)", async () => {
  const email = "test@google.com";
  const plaintextPassword = "pwd";

  const { req, res } = createMocks({
    method: "POST",
    body: {
      email,
      password: plaintextPassword,
    },
  });

  req.usersCollection = {
    async findOne() {
      return { email, password: "another pwd", authenticated: true };
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

  const response = await login(req, res);

  expect(response.statusCode).toEqual(500);
});

test("returns 500 if password matches but user is not authenticated", async () => {
  const email = "test@google.com";
  const plaintextPassword = "pwd";

  const { req, res } = createMocks({
    method: "POST",
    body: {
      email,
      password: plaintextPassword,
    },
  });

  req.usersCollection = {
    async findOne() {
      return {
        email,
        password: await hash(plaintextPassword, 12),
        authenticated: false,
      };
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

  const response = await login(req, res);

  expect(response.statusCode).toEqual(500);
});

test("returns 204 if password matches, user is updated and cookie is set", async () => {
  const email = "test@google.com";
  const plaintextPassword = "pwd";

  const { req, res } = createMocks({
    method: "POST",
    body: {
      email,
      password: plaintextPassword,
    },
  });

  type Update = { loginToken: { value: string; expiration: number } };
  let interceptedUpdate: Update = null;
  req.usersCollection = {
    async findOne() {
      return {
        email,
        password: await hash(plaintextPassword, 12),
        authenticated: true,
      };
    },
    async updateOne(_, update: Update) {
      interceptedUpdate = update;
      return "mongodb_id";
    },
  };

  req.logger = {
    debug() {},
    error() {},
  };

  req.localEnv = LOCAL_ENV;

  const response = await login(req, res);

  expect(response.statusCode).toEqual(204);

  const { [LOCAL_ENV.loginCookie.name]: cookie } = parse(
    response.getHeader("Set-Cookie") as string
  );

  expect(JSON.parse(cookie)).toEqual({
    loginToken: interceptedUpdate.loginToken.value,
    email,
  });
});
