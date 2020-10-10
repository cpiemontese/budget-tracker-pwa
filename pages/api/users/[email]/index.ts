import nextConnect from "next-connect";

import db from "../../../../middleware/database";
import logger from "../../../../middleware/logger";
import envLoader from "../../../../middleware/env-loader";
import verifier from "../../../../middleware/verifier";

import { getHandler } from "../../../../lib/crud/users/get";

const handler = nextConnect()
  .use(envLoader)
  .use(db)
  .use(logger)
  .use(verifier)
  .post(getHandler);

export default handler;
