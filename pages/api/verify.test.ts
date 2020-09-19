import { parse } from "cookie";
import { createMocks } from "node-mocks-http";

import { verify } from "./verify";

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

  const response = await verify(req, res);

  expect(response.statusCode).toEqual(400);
});

test("returns 500 if user is not found", async () => {
  const { req, res } = createMocks({
    method: "POST",
    body: {
      email: "test@google.com",
      loginToken: "token",
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

  const response = await verify(req, res);

  expect(response.statusCode).toEqual(500);
  expect(actualFilter).toEqual({ email: "test@google.com" });
});

test("returns 401 if token does not match", async () => {
  const { req, res } = createMocks({
    method: "POST",
    body: {
      email: "test@google.com",
      loginToken: "token",
    },
  });

  let actualFilter = null;
  req.usersCollection = {
    async findOne(filter) {
      actualFilter = filter;
      return {
        loginToken: "different token",
        loginTokenExpiration: Date.now() + 1000 * 60 * 60, // it expires in an hour
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

  const response = await verify(req, res);

  expect(response.statusCode).toEqual(401);
  expect(actualFilter).toEqual({ email: "test@google.com" });
});

test("returns 401 if token is expired", async () => {
  const { req, res } = createMocks({
    method: "POST",
    body: {
      email: "test@google.com",
      loginToken: "token",
    },
  });

  let actualFilter = null;
  req.usersCollection = {
    async findOne(filter) {
      actualFilter = filter;
      return {
        loginToken: "token",
        loginTokenExpiration: Date.now() - 1000 * 60 * 60, // it expired an hour ago
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

  const response = await verify(req, res);

  expect(response.statusCode).toEqual(401);
  expect(actualFilter).toEqual({ email: "test@google.com" });

  const { [LOCAL_ENV.loginCookie.name]: cookie } = parse(
    response.getHeader("Set-Cookie") as string
  );

  expect(JSON.parse(cookie)).toEqual(null);
});
