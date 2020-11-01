import nextConnect from "next-connect";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  NextApiRequestWithEnv,
} from "../../types";

import db from "../../middleware/database";
import logger from "../../middleware/logger";
import tracer from "../../middleware/tracer";
import envLoader from "../../middleware/env-loader";

import { createDeletionCookie } from "../../lib/cookies";

const handler = nextConnect()
  .use(envLoader)
  .use(db)
  .use(logger)
  .use(tracer)
  .get(logout);

export default handler;
export { logout };

async function logout(
  req: NextApiRequestWithDB & NextApiRequestWithLogger & NextApiRequestWithEnv,
  res: NextApiResponse
) {
  res.setHeader(
    "Set-Cookie",
    createDeletionCookie(req.localEnv.loginCookie.name)
  );

  res.status(204).json({});
  return res;
}
