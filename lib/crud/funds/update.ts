import get from "lodash.get";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  NextApiRequestWithEnv,
  User,
} from "../../../types";

export async function updateHandler(
  req: NextApiRequestWithDB & NextApiRequestWithEnv & NextApiRequestWithLogger,
  res: NextApiResponse
) {
  const email = get(req.query, ["email"], null) as string;
  const id = get(req.query, ["id"], null) as string;

  if ([email, id].some((value) => value === null)) {
    res.status(400).send({});
    return res;
  }

  let user: User = null;
  try {
    user = await req.usersCollection.findOne({ email, "funds.id": id });
  } catch (error) {
    req.logger.error(
      { error: error.message },
      "PATCH /funds - error on user find"
    );
    res.status(500).send({});
    return res;
  }

  // no user or fund found
  if (user === null || user === undefined) {
    res.status(400).send({});
    return res;
  }

  const amount = get(req.body, ["amount"], null) as string;
  const name = get(req.body, ["name"], null) as string;

  const $set = { "funds.$.updatedAt": Date.now() };
  if (amount !== null && amount !== undefined) {
    $set["funds.$.amount"] = amount;
  }

  if (name !== null && name !== undefined) {
    $set["funds.$.name"] = name;
  }

  try {
    await req.usersCollection.updateOne(
      {
        email,
        "funds.id": id,
      },
      {
        $set,
      }
    );
  } catch (error) {
    req.logger.error(
      { error: error.message },
      "PATCH /funds - error on fund update"
    );
    res.status(500).send({});
    return res;
  }

  res.status(204).json({});

  return res;
}
