import get from "lodash.get";
import nextConnect from "next-connect";

import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  User,
  NextApiRequestWithEnv,
  NextApiRequestWithTransporter,
} from "../../../types";

import db from "../../../middleware/database";
import logger from "../../../middleware/logger";
import envLoader from "../../../middleware/env-loader";
import transporter from "../../../middleware/transporter";

import { setToken } from "./set-token";
import { setPassword } from "./set-password";

const handler = nextConnect()
  .use(envLoader)
  .use(db)
  .use(logger)
  .use(transporter)
  .post(reset);

export default handler;
export { reset };

async function reset(
  req: NextApiRequestWithDB &
    NextApiRequestWithLogger &
    NextApiRequestWithEnv &
    NextApiRequestWithTransporter,
  res: NextApiResponse
) {
  const email = get(req.body, ["email"], null) as string;
  const resetToken = get(req.body, ["token"], null) as string;
  const plainTextPassword = get(req.body, ["password"], null) as string;

  if (email === null) {
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
      "/api/reset - user fetch error"
    );
    res.status(204).send({});
    return res;
  }

  if (user === null || user === undefined) {
    res.status(204).send({});
    return res;
  }

  const { authenticated } = user;

  if (!authenticated) {
    res.status(204).send({});
    return res;
  }

  if (resetToken === null || plainTextPassword === null) {
    // this is a request for a token
    // we must generate and send the token to the user email
    const status = await setToken(
      user,
      req.localEnv,
      req.usersCollection,
      req.transporter,
      req.logger
    );

    res.status(status).send({});
    return res;
  }

  const status = await setPassword(
    resetToken,
    plainTextPassword,
    user,
    req.localEnv,
    req.usersCollection,
    req.transporter,
    req.logger
  );

  res.status(status).send({});
  return res;
}
