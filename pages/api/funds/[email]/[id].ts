import nextConnect from "next-connect";

import db from "../../../../middleware/database";
import logger from "../../../../middleware/logger";
import envLoader from "../../../../middleware/env-loader";
import verifier from "../../../../middleware/verifier";
import tracer from "../../../../middleware/tracer";

import { updateHandler } from "../../../../lib/crud/funds/update";
import { deleteHandler } from "../../../../lib/crud/funds/delete";

const handler = nextConnect()
  .use(envLoader)
  .use(db)
  .use(logger)
  .use(verifier)
  .use(tracer)
  .patch(updateHandler)
  .delete(deleteHandler);

export default handler;
