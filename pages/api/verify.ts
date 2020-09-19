import get from "lodash.get";
import nextConnect from "next-connect";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  User,
  NextApiRequestWithEnv,
} from "../../types";

import db from "../../middleware/database";
import logger from "../../middleware/logger";
import { createDeletionCookie } from "../../lib/cookies";

const handler = nextConnect().use(db).use(logger).post(verify);

export default handler;
export { verify };

async function verify(
  req: NextApiRequestWithDB & NextApiRequestWithLogger & NextApiRequestWithEnv,
  res: NextApiResponse
) {
  const email = get(req.body, ["email"], null) as string;
  const loginTokenToVerify = get(req.body, ["loginToken"], null) as string;

  if ([email, loginTokenToVerify].some((value) => value === null)) {
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
      "/api/verify - user fetch error"
    );
    res.status(500).send({});
    return res;
  }

  if (user === null || user === undefined) {
    res.status(500).send({});
    return res;
  }

  const { loginToken, loginTokenExpiration } = user;

  const tokenIsExpired = Date.now() > loginTokenExpiration;
  const tokenMatches = loginToken === loginTokenToVerify;

  let status = !tokenMatches || tokenIsExpired ? 401 : 204;

  if (tokenIsExpired) {
    res.setHeader(
      "Set-Cookie",
      createDeletionCookie(req.localEnv.loginCookie.name)
    );
  }

  res.status(status).send({});
  return res;
}
