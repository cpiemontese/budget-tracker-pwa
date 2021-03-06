import get from "lodash.get";
import nextConnect from "next-connect";

import { compare } from "bcrypt";
import { randomBytes } from "crypto";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  User,
  NextApiRequestWithEnv,
} from "../../types";

import db from "../../middleware/database";
import logger from "../../middleware/logger";
import tracer from "../../middleware/tracer";
import envLoader from "../../middleware/env-loader";
import { createCookie } from "../../lib/cookies";

const handler = nextConnect()
  .use(envLoader)
  .use(db)
  .use(logger)
  .use(tracer)
  .post(login);

export default handler;
export { login };

const LOGIN_TOKEN_LENGTH = 16;

async function login(
  req: NextApiRequestWithDB & NextApiRequestWithLogger & NextApiRequestWithEnv,
  res: NextApiResponse
) {
  const email = get(req.body, ["email"], null) as string;
  const plainTextPassword = get(req.body, ["password"], null) as string;

  if ([email, plainTextPassword].some((value) => value === null)) {
    res.status(400).send({});
    return res;
  }

  let user: User = null;
  try {
    user = await req.usersCollection.findOne({ email });
  } catch (error) {
    req.logger.error(
      {
        error: error.message,
      },
      "/api/login - user fetch error"
    );
    res.status(500).send({});
    return res;
  }

  if (user === null || user === undefined) {
    res.status(500).send({});
    return res;
  }

  const { password, authenticated } = user;

  const passwordMatches = await compare(plainTextPassword, password);
  if (!passwordMatches || !authenticated) {
    res.status(500).send({});
    return res;
  }

  const value = randomBytes(LOGIN_TOKEN_LENGTH).toString("hex");
  const expiration = Date.now() + req.localEnv.loginCookie.maxAge;
  const cookie = createCookie(
    req.localEnv.loginCookie.name,
    JSON.stringify({
      email,
      loginToken: value,
    }),
    expiration
  );

  try {
    await req.usersCollection.updateOne(
      { email },
      { $set: { loginToken: { value, expiration } } }
    );
  } catch (error) {
    req.logger.error(
      {
        error: error.message,
      },
      "/api/login - user update error"
    );
    res.status(500).send({});
    return res;
  }

  res.setHeader("Set-Cookie", cookie);

  res.status(204).send({});
  return res;
}
