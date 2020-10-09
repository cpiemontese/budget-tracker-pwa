import get from "lodash.get";
import cloneDeep from "lodash.clonedeep";

import { NextApiResponse } from "next";

import {
  NextApiRequestWithDB,
  NextApiRequestWithLogger,
  NextApiRequestWithEnv,
  User,
} from "../../../types";

const amountToValue = (amount: number, type: string) =>
  type === "expense" ? -amount : amount;

function parseFloatNullable(value: string) {
  const floatValue = parseFloat(value);
  return isNaN(floatValue) ? null : Math.abs(floatValue);
}

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
  const amount = parseFloatNullable(get(req.body, ["amount"], null) as string);
  const fund = get(req.body, ["fund"], null) as string;
  const category = get(req.body, ["category"], null) as string;
  const description = get(req.body, ["description"], null) as string;

  const $set = addPropsIfNotNull(
    {},
    [
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
    ],
    "budgetItems.$."
  );

  $set["budgetItems.$.updatedAt"] = Date.now();

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

  const fundToGiveBackTo = budgetItem.fund;
  const amountToGiveBack = amountToValue(budgetItem.amount, budgetItem.type);

  try {
    await req.usersCollection.updateOne(
      {
        email,
        "funds.id": fundToGiveBackTo,
      },
      {
        $inc: {
          "funds.$.amount": -amountToGiveBack,
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

  const amountToGive = amountToValue(
    amount || budgetItem.amount,
    type || budgetItem.type
  );
  const fundToGiveTo = fund || fundToGiveBackTo;

  try {
    await req.usersCollection.updateOne({
      email,
      "budgetItems.id": id,
    }, { $set });

    await req.usersCollection.updateOne({
      email,
      "funds.id": fundToGiveTo,
    }, {
      $inc: {
        "funds.$.amount": amountToGive,
      }
    });
  } catch (error) {
    req.logger.error(
      { error: error.message },
      "PATCH /budgetItems - error on budget item update"
    );
    res.status(500).send({});
    return res;
  }

  res.status(204).send({});
  return res;
}

function addPropsIfNotNull(
  object,
  props: Array<{ name: string; value: any }>,
  prefix = ""
) {
  const clone = cloneDeep(object);
  props.forEach(({ name, value }) => {
    if (value !== null) {
      clone[`${prefix}${name}`] = value;
    }
  });
  return clone;
}
