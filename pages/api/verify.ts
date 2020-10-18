import nextConnect from "next-connect";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  NextApiRequestWithEnv,
} from "../../types";

import db from "../../middleware/database";
import logger from "../../middleware/logger";
import envLoader from "../../middleware/env-loader";

import { verifyHandler } from "../../lib/verify-handler";
import { createDeletionCookie, getLoginCookie } from "../../lib/cookies";
import { getNullUser } from "../../lib/common";

const handler = nextConnect().use(envLoader).use(db).use(logger).get(verify);

export default handler;
export { verify };

async function verify(
  req: NextApiRequestWithDB & NextApiRequestWithLogger & NextApiRequestWithEnv,
  res: NextApiResponse
) {
  const { email, loginToken } = getLoginCookie(
    req,
    req.localEnv.loginCookie.name,
    req.logger
  );

  let responseCode = await verifyHandler(
    email,
    loginToken,
    req.usersCollection,
    req.logger
  );

  let user = getNullUser()
  if (responseCode === 204) {
    user = await req.usersCollection.findOne({ email });
    responseCode = 200;
  }

  if (responseCode === 401) {
    // there should be no need to reset the cookie in the user doc
    // it will be reset by a new login
    res.setHeader(
      "Set-Cookie",
      createDeletionCookie(req.localEnv.loginCookie.name)
    );
  }

  res.status(responseCode).json(user);
  return res;
}
