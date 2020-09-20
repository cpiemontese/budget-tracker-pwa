import get from "lodash.get";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  NextApiRequestWithEnv,
} from "../../../types";

export async function read(
  req: NextApiRequestWithDB & NextApiRequestWithEnv & NextApiRequestWithLogger,
  res: NextApiResponse
) {
  const email = get(req.query, ["email"], null) as string;
  const id = get(req.query, ["id"], null) as string;

  let fund = null;
  try {
    fund = await req.usersCollection.findOne({ email, "funds.$.id": id });
  } catch (error) {
    req.logger.error(
      { error: error.message },
      "GET /funds - error on fund get"
    );
    res.status(500).send({});
    return res;
  }

  res.status(201).json({
    fund,
  });

  return res;
}
