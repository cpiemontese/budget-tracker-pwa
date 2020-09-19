import nextConnect, { NextHandler } from "next-connect";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  NextApiRequestWithEnv,
} from "../types";

import { verifyHandler } from "../lib/verify-handler";
import { createDeletionCookie, getLoginCookie } from "../lib/cookies";

async function verifier(
  req: NextApiRequestWithDB & NextApiRequestWithLogger & NextApiRequestWithEnv,
  res: NextApiResponse,
  next: NextHandler
) {
  const { email, loginToken } = getLoginCookie(
    res,
    req.localEnv.loginCookie.name,
    req.logger
  );

  const responseCode = await verifyHandler(
    email,
    loginToken,
    req.usersCollection,
    req.logger
  );

  if (responseCode === 401) {
    // there should be no need to reset the cookie in the user doc
    // it will be reset by a new login
    res.setHeader(
      "Set-Cookie",
      createDeletionCookie(req.localEnv.loginCookie.name)
    );
  }

  if (responseCode !== 204) {
    res.status(responseCode).send({});
    return res;
  }

  return next();
}

const middleware = nextConnect();

middleware.use(verifier);

export default middleware;
