import get from "lodash.get";
import nextConnect from "next-connect";
import { compare } from "bcrypt";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  User,
} from "../../types";

import db from "../../middleware/database";
import logger from "../../middleware/logger";
import { getCookie } from "../../lib/cookies";
import { randomBytes } from "crypto";

const handler = nextConnect();

handler.use(db);
handler.use(logger);

handler.post(login);

export default handler;
export { login };

const LOGIN_TOKEN_LENGTH = 16;

async function login(
  req: NextApiRequestWithDB & NextApiRequestWithLogger,
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

  const { password } = user;

  const passwordMatches = await compare(plainTextPassword, password);
  if (!passwordMatches) {
    res.status(500).send({});
    return res;
  }

  const loginToken = randomBytes(LOGIN_TOKEN_LENGTH).toString("hex");
  const loginTokenMaxAge = parseInt(process.env.LOGIN_TOKEN_MAX_AGE);
  const cookie = getCookie(
    process.env.LOGIN_TOKEN_NAME,
    loginToken,
    loginTokenMaxAge
  );

  try {
    req.usersCollection.updateOne({ email }, { loginToken, loginTokenMaxAge });
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
