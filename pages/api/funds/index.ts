import get from "lodash.get";
import nextConnect from "next-connect";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithTransporter,
  NextApiRequestWithLogger,
  NextApiRequestWithEnv,
  User,
} from "../../../types";

import db from "../../../middleware/database";
import logger from "../../../middleware/logger";
import envLoader from "../../../middleware/env-loader";
import verifier from "../../../middleware/env-loader";

const handler = nextConnect().use(envLoader).use(db).use(logger).post(create);

async function create(
  req: NextApiRequestWithDB & NextApiRequestWithEnv & NextApiRequestWithLogger,
  res: NextApiResponse
) {
  res.status(204).send({});
  return res;
}

export default handler;
export { create as authenticate };
