import { parse } from "cookie";
import { createMocks } from "node-mocks-http";

import { verify } from "./verify";

import getEnv from "../../lib/test-env";
import { createCookie } from "../../lib/cookies";
import { serialize } from "cookie";

const LOCAL_ENV = getEnv();

test("returns 400 if there is no login Cookie", async () => {
  const { req, res } = createMocks({
    method: "GET",
  });

  req.transporter = {
    async sendMail() {},
  };

  req.logger = {
    debug() {},
    error() {},
  };

  req.localEnv = LOCAL_ENV;

  res.setHeader("Cookie", "");

  const response = await verify(req, res);

  expect(response.statusCode).toEqual(400);
});

test("returns 500 if user is not found", async () => {
  const { req, res } = createMocks({
    method: "GET",
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

  res.setHeader(
    "Cookie",
    createCookie(
      LOCAL_ENV.loginCookie.name,
      JSON.stringify({
        email: "test@google.com",
        loginToken: "token",
      }),
      1000 * 60 * 60
    )
  );

  req.localEnv = LOCAL_ENV;

  const response = await verify(req, res);

  expect(response.statusCode).toEqual(500);
  expect(actualFilter).toEqual({ email: "test@google.com" });
});

test("returns 401 if token does not match", async () => {
  const { req, res } = createMocks({
    method: "GET",
  });

  let actualFilter = null;
  req.usersCollection = {
    async findOne(filter) {
      actualFilter = filter;
      return {
        loginToken: {
          value: "different token",
          expiration: Date.now() + 1000 * 60 * 60, // it expires in an hour ago
        },
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

  res.setHeader(
    "Cookie",
    createCookie(
      LOCAL_ENV.loginCookie.name,
      JSON.stringify({
        email: "test@google.com",
        loginToken: "token",
      }),
      1000 * 60 * 60
    )
  );

  const response = await verify(req, res);

  expect(response.statusCode).toEqual(401);
  expect(actualFilter).toEqual({ email: "test@google.com" });
});

test("returns 401 if token is expired", async () => {
  const { req, res } = createMocks({
    method: "GET",
  });

  let actualFilter = null;
  req.usersCollection = {
    async findOne(filter) {
      actualFilter = filter;
      return {
        loginToken: {
          value: "token",
          expiration: Date.now() - 1000 * 60 * 60, // it expires in an hour ago
        },
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

  res.setHeader(
    "Cookie",
    createCookie(
      LOCAL_ENV.loginCookie.name,
      JSON.stringify({
        email: "test@google.com",
        loginToken: "token",
      }),
      1000 * 60 * 60
    )
  );

  req.localEnv = LOCAL_ENV;

  const response = await verify(req, res);

  expect(response.statusCode).toEqual(401);
  expect(actualFilter).toEqual({ email: "test@google.com" });

  const { [LOCAL_ENV.loginCookie.name]: cookie } = parse(
    response.getHeader("Set-Cookie") as string
  );

  expect(JSON.parse(cookie)).toEqual(null);
});

test("returns 204 if token is valid", async () => {
  const { req, res } = createMocks({
    method: "GET",
  });

  let actualFilter = null;
  req.usersCollection = {
    async findOne(filter) {
      actualFilter = filter;
      return {
        loginToken: {
          value: "token",
          expiration: Date.now() + 1000 * 60 * 60, // it expires in an hour ago
        },
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

  res.setHeader(
    "Cookie",
    createCookie(
      LOCAL_ENV.loginCookie.name,
      JSON.stringify({
        email: "test@google.com",
        loginToken: "token",
      }),
      1000 * 60 * 60
    )
  );

  req.localEnv = LOCAL_ENV;

  const response = await verify(req, res);

  expect(response.statusCode).toEqual(204);
  expect(actualFilter).toEqual({ email: "test@google.com" });
});
