import nextConnect from "next-connect";

import db from "../../../../middleware/database";
import logger from "../../../../middleware/logger";
import envLoader from "../../../../middleware/env-loader";
import verifier from "../../../../middleware/verifier";

import { updateHandler } from "../../../../lib/crud/budget-items/update";
import { deleteHandler } from "../../../../lib/crud/budget-items/delete";

const handler = nextConnect()
  .use(envLoader)
  .use(db)
  .use(logger)
  .use(verifier)
  .patch(updateHandler)
  .delete(deleteHandler);

export default handler;
