import get from "lodash.get";
import set from "lodash.set";
import cloneDeep from "lodash.clonedeep";

import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  NextApiRequestWithEnv,
  User,
} from "../../../types";

import { randomBytes } from "crypto";

const BUDGET_ITEMS_ID_LENGTH = 8;

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

  const name = get(req.body, ["name"], null) as string;
  const type = get(req.body, ["type"], null) as string;
  const amount = get(req.body, ["amount"], null) as number;
  const fund = get(req.body, ["fund"], null) as string;
  const category = get(req.body, ["category"], null) as string;
  const description = get(req.body, ["description"], null) as string;

  const $set = addPropsIfNotNull({}, [
    {
      name: "name",
      value: name,
    },
    {
      name: "type",
      value: type,
    },
    {
      name: "amount",
      value: amount,
    },
    {
      name: "fund",
      value: fund,
    },
    {
      name: "category",
      value: category,
    },
    {
      name: "description",
      value: description,
    },
  ]);

  const fixedAmount = type === "expense" ? -Math.abs(amount) : Math.abs(amount);

  const budgetItemId = randomBytes(BUDGET_ITEMS_ID_LENGTH).toString("hex");

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
  const fundChanged = fund !== null && fund !== undefined;
  let previousFund = budgetItem.fund;
  let previousAmount = budgetItem.amount;

  if (fundChanged) {
    try {
      await req.usersCollection.updateOne(
        {
          email,
          "funds.id": previousFund,
        },
        {
          $inc: {
            "funds.$.amount": -previousAmount, // give back the previous amount to the old fund
          },
        }
      );
    } catch (error) {
      req.logger.error(
        { error: error.message },
        "PATCH /budgetItems - error on previous fund update"
      );
      res.status(500).send({});
      return res;
    }
  }

  const filter = {
    email,
    "budgetItems.id": id,
    ...(fundChanged ? { "funds.id": fund } : {}),
  };

  const update = {
    $set,
    ...(fundChanged
      ? {
          $inc: {
            "funds.$.amount": fixedAmount,
          },
        }
      : {}),
  };

  try {
    await req.usersCollection.updateOne(filter, update);
  } catch (error) {
    req.logger.error(
      { error: error.message },
      "PATCH /budgetItems - error on budget item update"
    );
    res.status(500).send({});
    return res;
  }

  res.status(201).json({
    id: budgetItemId,
  });
  return res;
}

function addPropsIfNotNull(object, props: Array<{ name: string; value: any }>) {
  const clone = cloneDeep(object);
  props.forEach(({ name, value }) => {
    set(clone, name, value);
  });
  return clone;
}
