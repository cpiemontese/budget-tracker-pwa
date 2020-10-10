import get from "lodash.get";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  NextApiRequestWithEnv,
  User,
} from "../../../types";

export async function getHandler(
  req: NextApiRequestWithDB & NextApiRequestWithEnv & NextApiRequestWithLogger,
  res: NextApiResponse
) {
  const email = get(req.query, ["email"], null) as string;

  if (email === null) {
    res.status(400).send({});
    return res;
  }

  let user: User = null;
  try {
    user = await req.usersCollection.findOne({ email });
  } catch (error) {
    req.logger.error(
      { error: error.message },
      "GET /users - error on user find"
    );
    res.status(500).send({});
    return res;
  }

  // no user or fund found
  if (user === null || user === undefined) {
    res.status(404).send({});
    return res;
  }

  res.status(200).json(user);

  return res;
}
