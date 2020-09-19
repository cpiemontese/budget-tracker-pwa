import nextConnect from "next-connect";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  NextApiRequestWithEnv,
} from "../../types";

import db from "../../middleware/database";
import logger from "../../middleware/logger";

import { verifyhandler } from "../../lib/verify-handler";

const handler = nextConnect().use(db).use(logger).post(verify);

export default handler;
export { verify };

async function verify(
  req: NextApiRequestWithDB & NextApiRequestWithLogger & NextApiRequestWithEnv,
  res: NextApiResponse
) {
  return verifyhandler(req, res);
}
