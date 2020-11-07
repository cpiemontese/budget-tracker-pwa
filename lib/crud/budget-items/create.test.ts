import pino from "pino";
import { randomBytes } from "crypto";
import { MongoClient } from "mongodb";
import { createMocks } from "node-mocks-http";

import { createHandler } from "./create";

import getEnv from "../../test-env";
import { User } from "../../../types";

const randomString = () => randomBytes(8).toString("hex");

const LOCAL_ENV = getEnv();

const MONGODB_URI = "mongodb://localhost:27017";

const logger = pino({ level: "debug" });

test("returns 400 if required properties are missing from query and body", async () => {
  const { req, res } = createMocks({
    method: "POST",
    query: null,
    body: null,
  });

  req.logger = logger;

  req.localEnv = LOCAL_ENV;

  const response = await createHandler(req, res);

  expect(response.statusCode).toEqual(400);
});

test("returns 201 if budget item is created", async () => {
  const mongoClient = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await mongoClient.connect();
  const dbName = randomString();
  const db = mongoClient.db(dbName);
  const collectionName = randomString();
  const collection = db.collection(collectionName);

  const email = "test@gmail.com";

  const fundId = randomString();
  const initialFundAmount = 100.0;
  await collection.insertOne({
    email,
    funds: [
      {
        id: fundId,
        name: "some fund",
        amount: initialFundAmount,
      },
    ],
    budgetItems: [],
  });

  const name = "name";
  const type = "expense";
  const amount = 10.28;
  const now = Date.now();
  const { req, res } = createMocks({
    method: "POST",
    query: {
      email,
    },
    body: {
      name,
      type,
      amount,
      fund: fundId,
      date: now,
    },
  });

  req.logger = logger;

  req.usersCollection = collection;

  req.localEnv = LOCAL_ENV;

  try {
    const response = await createHandler(req, res);

    expect(response.statusCode).toEqual(201);

    const user: User = await collection.findOne({ email });

    expect(user.budgetItems.length).toBe(1);
    expect(user.budgetItems[0]).toMatchObject({
      name,
      type,
      amount,
      fund: fundId,
    });
    expect(user.budgetItems[0].id).not.toBe(null);
    expect(user.budgetItems[0].date).toBe(now);
    expect(user.budgetItems[0].createdAt).not.toBe(null);
    expect(user.budgetItems[0].updatedAt).toBe(user.budgetItems[0].createdAt);

    expect(user.funds[0].amount).toBe(initialFundAmount - amount);
  } finally {
    await db.dropDatabase();
    await mongoClient.close();
  }
});
