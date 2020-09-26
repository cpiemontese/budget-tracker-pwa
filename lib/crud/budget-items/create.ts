import get from "lodash.get";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  NextApiRequestWithEnv,
} from "../../../types";

import { randomBytes } from "crypto";

const BUDGET_ITEMS_ID_LENGTH = 8;

export async function createHandler(
  req: NextApiRequestWithDB & NextApiRequestWithEnv & NextApiRequestWithLogger,
  res: NextApiResponse
) {
  const email = get(req.query, ["email"], null) as string;
  const name = get(req.body, ["name"], null) as string;
  const type = get(req.body, ["type"], null) as string;
  const amount = get(req.body, ["amount"], null) as number;
  const fund = get(req.body, ["fund"], null) as string;

  if ([email, name, amount, type, fund].some((value) => value === null)) {
    res.status(400).send({});
    return res;
  }

  const fixedAmount = type === "expense" ? -Math.abs(amount) : Math.abs(amount);

  const category = get(req.body, ["category"], null) as string;
  const description = get(req.body, ["description"], null) as string;

  const budgetItemId = randomBytes(BUDGET_ITEMS_ID_LENGTH).toString("hex");
  const createdAt = Date.now();

  try {
    await req.usersCollection.updateOne(
      {
        email,
        "funds.id": fund,
      },
      {
        $push: {
          budgetItems: {
            id: budgetItemId,
            name,
            type,
            amount: fixedAmount,
            fund,
            category,
            description,
            createdAt,
            updatedAt: createdAt,
          },
        },
        $inc: {
          "funds.$.amount": fixedAmount,
        },
      }
    );
  } catch (error) {
    req.logger.error(
      { error: error.message },
      "POST /budgetItems - error on budget item creation"
    );
    res.status(500).send({});
    return res;
  }

  res.status(201).json({
    id: budgetItemId,
  });
  return res;
}
