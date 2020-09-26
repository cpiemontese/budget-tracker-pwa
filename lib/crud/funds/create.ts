import get from "lodash.get";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  NextApiRequestWithEnv,
} from "../../../types";

import { randomBytes } from "crypto";

const FUNDS_ID_LENGTH = 8;
export async function createHandler(
  req: NextApiRequestWithDB & NextApiRequestWithEnv & NextApiRequestWithLogger,
  res: NextApiResponse
) {
  const email = get(req.query, ["email"], null) as string;
  const name = get(req.body, ["name"], null) as string;
  const amount = get(req.body, ["amount"], null) as number;

  if ([email, name, amount].some((value) => value === null)) {
    res.status(400).send({});
    return res;
  }

  const fundId = randomBytes(FUNDS_ID_LENGTH).toString("hex");
  const createdAt = Date.now();
  try {
    await req.usersCollection.updateOne(
      { email },
      {
        $push: {
          funds: {
            id: fundId,
            name,
            amount,
            createdAt,
            updatedAt: createdAt,
          },
        },
      }
    );
  } catch (error) {
    req.logger.error(
      { error: error.message },
      "POST /funds - error on fund creation"
    );
    res.status(500).send({});
    return res;
  }

  res.status(201).json({
    id: fundId,
  });
  return res;
}
