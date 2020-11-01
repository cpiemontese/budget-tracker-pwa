import pino from "pino";
import { MongoClient } from "mongodb";
import { createMocks } from "node-mocks-http";

import { deleteHandler } from "./delete";

import getEnv from "../../test-env";
import { User } from "../../../types";
import {
  randomExpense,
  randomFund,
  randomIncome,
  randomString,
} from "../../common";

const LOCAL_ENV = getEnv();

const MONGODB_URI = "mongodb://localhost:27017";

const logger = pino({ level: "debug" });

test("returns 400 if properties are missing from query", async () => {
  const { req, res } = createMocks({
    method: "POST",
    query: null,
  });

  req.logger = logger;
  req.localEnv = LOCAL_ENV;

  const response = await deleteHandler(req, res);

  expect(response.statusCode).toEqual(400);
});

test("returns 204 if fund is deleted - delete all linked budget items", async () => {
  const email = "test@gmail.com";

  const fundToDelete = randomFund();
  const fundNotToDelete = randomFund();

  const itemToDelete = randomExpense(fundToDelete.id);
  const itemNotToDelete = randomIncome(fundNotToDelete.id);

  const mongoClient = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await mongoClient.connect();
  const dbName = randomString();
  const db = mongoClient.db(dbName);
  const collectionName = randomString();
  const collection = db.collection(collectionName);

  await collection.insertOne({
    email,
    funds: [fundToDelete, fundNotToDelete],
    budgetItems: [itemToDelete, itemNotToDelete],
  });

  const { req, res } = createMocks({
    method: "DELETE",
    query: {
      email,
      id: fundToDelete.id,
      substituteId: "delete-all",
    },
  });

  req.logger = logger;
  req.usersCollection = collection;
  req.localEnv = LOCAL_ENV;

  try {
    const response = await deleteHandler(req, res);

    expect(response.statusCode).toEqual(204);

    const user: User = await collection.findOne({ email });

    expect(user.funds.length).toBe(1);
    expect(user.funds.find(({ id }) => id === fundToDelete.id)).toBe(undefined);

    expect(user.budgetItems.length).toBe(1);
    expect(user.budgetItems.find(({ id }) => id === itemToDelete.id)).toBe(
      undefined
    );
  } finally {
    await db.dropDatabase();
    await mongoClient.close();
  }
});

test("returns 204 if fund is deleted - move all linked budget items", async () => {
  const email = "test@gmail.com";

  const fundToDelete = randomFund();
  const fundNotToDelete = randomFund();

  const itemToMove = randomExpense(fundToDelete.id);
  const itemNotToMove = randomIncome(fundNotToDelete.id);

  const mongoClient = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await mongoClient.connect();
  const dbName = randomString();
  const db = mongoClient.db(dbName);
  const collectionName = randomString();
  const collection = db.collection(collectionName);

  await collection.insertOne({
    email,
    funds: [fundToDelete, fundNotToDelete],
    budgetItems: [itemToMove, itemNotToMove],
  });

  const { req, res } = createMocks({
    method: "DELETE",
    query: {
      email,
      id: fundToDelete.id,
      substituteId: fundNotToDelete.id,
    },
  });

  req.logger = logger;
  req.usersCollection = collection;
  req.localEnv = LOCAL_ENV;

  try {
    const response = await deleteHandler(req, res);

    expect(response.statusCode).toEqual(204);

    const user: User = await collection.findOne({ email });

    expect(user.funds.length).toBe(1);
    expect(user.funds.find(({ id }) => id === fundToDelete.id)).toBe(undefined);

    expect(user.budgetItems.length).toBe(2);
    expect(user.budgetItems.find(({ id }) => id === itemToMove.id)).not.toBe(
      undefined
    );
    expect(user.funds.find(({ id }) => id === fundNotToDelete.id).amount).toBe(
      fundNotToDelete.amount - itemToMove.amount
    );
  } finally {
    await db.dropDatabase();
    await mongoClient.close();
  }
});
