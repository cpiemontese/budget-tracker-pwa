import get from "lodash.get";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  NextApiRequestWithEnv,
} from "../../../types";

export async function deleteHandler(
  req: NextApiRequestWithDB & NextApiRequestWithEnv & NextApiRequestWithLogger,
  res: NextApiResponse
) {
  const email = get(req.query, ["email"], null) as string;
  const id = get(req.query, ["id"], null) as string;

  if ([email, id].some((value) => value === null)) {
    res.status(400).send({});
    return res;
  }

  let fund = null;
  try {
    await req.usersCollection.updateOne(
      {
        email,
        "funds.id": id,
      },
      {
        $pull: {
          funds: {
            id,
          },
        },
      }
    );
  } catch (error) {
    req.logger.error(
      { error: error.message },
      "DELETE /funds - error on fund delete"
    );
    res.status(500).send({});
    return res;
  }

  res.status(204).json({});

  return res;
}
