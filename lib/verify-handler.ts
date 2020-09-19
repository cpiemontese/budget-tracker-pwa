import get from "lodash.get";
import { parse } from "cookie";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  User,
  NextApiRequestWithEnv,
} from "../types";

import { createDeletionCookie } from "./cookies";

export { verifyhandler };

async function verifyhandler(
  req: NextApiRequestWithDB & NextApiRequestWithLogger & NextApiRequestWithEnv,
  res: NextApiResponse
) {
  const cookies = parse(res.getHeader("Cookie") as string);

  const loginCookie = JSON.parse(
    get(cookies, req.localEnv.loginCookie.name, "null")
  );

  const email = get(loginCookie, ["email"], null);
  const loginTokenToVerify = get(loginCookie, ["loginToken"], null);

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
    // there should be no need to reset the cookie in the user doc
    // it will be reset by a new login
    res.setHeader(
      "Set-Cookie",
      createDeletionCookie(req.localEnv.loginCookie.name)
    );
  }

  res.status(status).send({});
  return res;
}
