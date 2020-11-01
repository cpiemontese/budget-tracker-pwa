import get from "lodash.get";
import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  NextApiRequestWithEnv,
  BudgetItem,
  User,
} from "../../../types";
import { amountToValue } from "../budget-items/common";

export async function deleteHandler(
  req: NextApiRequestWithDB & NextApiRequestWithEnv & NextApiRequestWithLogger,
  res: NextApiResponse
) {
  const email = get(req.query, ["email"], null) as string;
  const id = get(req.query, ["id"], null) as string;
  const substituteId = get(req.query, ["substituteId"], null) as string;

  if ([email, id, substituteId].some((value) => value === null)) {
    res.status(400).send({});
    return res;
  }

  let linkedItems: Array<BudgetItem> = [];
  try {
    const user: User = await req.usersCollection.findOne({ email });
    linkedItems = user.budgetItems.filter(({ fund }) => fund === id);
  } catch (error) {
    req.logger.error(
      { error: error.message },
      "DELETE /funds - error on linked budget items find"
    );
    res.status(500).send({});
    return res;
  }

  const amountToUpdate = linkedItems.reduce((prev, curr) => {
    return prev + amountToValue(curr.amount, curr.type);
  }, 0.0);

  if (substituteId === "delete-all") {
    try {
      await req.usersCollection.updateOne(
        {
          email,
          "budgetItems.fund": id,
        },
        {
          $pull: {
            budgetItems: {
              id: { $in: linkedItems.map(({ id }) => id) },
            },
          },
        }
      );
    } catch (error) {
      req.logger.error(
        { error: error.message },
        "DELETE /funds - error on budget items delete"
      );
      res.status(500).send({});
      return res;
    }
  } else {
    try {
      await req.usersCollection.updateMany(
        {
          email,
          "budgetItems.fund": id,
        },
        {
          $set: {
            fund: substituteId,
          },
        }
      );

      await req.usersCollection.updateOne(
        {
          email,
          "funds.id": substituteId,
        },
        {
          $inc: {
            "funds.$.amount": amountToUpdate,
          },
        }
      );
    } catch (error) {
      req.logger.error(
        { error: error.message },
        "DELETE /funds - error on substitute update"
      );
      res.status(500).send({});
      return res;
    }
  }

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
