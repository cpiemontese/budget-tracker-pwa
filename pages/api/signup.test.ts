import { createMocks } from "node-mocks-http";
import { signup } from "./signup";
import { compare } from "bcrypt";

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

type UserDoc = {
  email: string;
  username: string;
  password: string;
  authenticated: boolean;
};

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
    authenticated: false,
  });

  expect(await compare(plaintextPassword, actualUserDoc.password)).toBe(true);
});
