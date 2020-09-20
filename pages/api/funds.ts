import nextConnect from "next-connect";

import db from "../../middleware/database";
import logger from "../../middleware/logger";
import envLoader from "../../middleware/env-loader";
import verifier from "../../middleware/env-loader";

import { create } from "../../lib/crud/funds/create";

const handler = nextConnect()
  .use(envLoader)
  .use(db)
  .use(logger)
  .use(verifier)
  .post(create);

export default handler;
