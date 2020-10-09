import get from "lodash.get";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  NextApiRequestWithEnv,
  User,
} from "../../../types";
import { amountToValue } from "./common";

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

  let user: User = null;
  try {
    user = await req.usersCollection.findOne({ email, "budgetItems.id": id });
  } catch (error) {
    req.logger.error(
      { error: error.message },
      "PATCH /budgetItems - error on user find"
    );
    res.status(500).send({});
    return res;
  }

  // no user or budget item found
  if (user === null || user === undefined) {
    res.status(400).send({});
    return res;
  }

  const budgetItem = user.budgetItems.find(({ id: itemId }) => itemId === id);

  try {
    await req.usersCollection.updateOne(
      {
        email,
        "funds.id": budgetItem.fund,
      },
      {
        $inc: {
          "funds.$.amount": -amountToValue(budgetItem.amount, budgetItem.type),
        },
      }
    );

    await req.usersCollection.updateOne(
      {
        email,
      }, 
      {
        $pull: {
          "budgetItems": { id },
        }
      }
    );
  } catch (error) {
    req.logger.error(
      { error: error.message },
      "DELETE /budget-items - error on budget item delete"
    );
    res.status(500).send({});
    return res;
  }

  res.status(204).json({});

  return res;
}
