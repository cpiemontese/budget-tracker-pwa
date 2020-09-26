import pino from "pino";
import { randomBytes } from "crypto";
import { MongoClient } from "mongodb";
import { createMocks } from "node-mocks-http";

import { create } from "./create";

import getEnv from "../../test-env";
import { User } from "../../../types";

const randomString = () => randomBytes(8).toString("hex");

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

  const response = await create(req, res);

  expect(response.statusCode).toEqual(400);
});

test("returns 201 if fund is created", async () => {
  const email = "test@gmail.com";
  const name = "fund";
  const amount = 100.0;

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
    funds: [],
  });

  const { req, res } = createMocks({
    method: "POST",
    query: {
      email,
    },
    body: {
      name,
      amount,
    },
  });

  req.logger = logger;

  req.usersCollection = collection;

  req.localEnv = LOCAL_ENV;

  try {
    const response = await create(req, res);

    expect(response.statusCode).toEqual(201);

    const user: User = await collection.findOne({ email });

    expect(user.funds.length).toBe(1);
    expect(user.funds[0]).toMatchObject({
      name,
      amount,
    });
    expect(user.funds[0].id).not.toBe(null);
    expect(user.funds[0].createdAt).not.toBe(null);
    expect(user.funds[0].updatedAt).toBe(user.funds[0].createdAt);
  } finally {
    await db.dropDatabase();
    await mongoClient.close();
  }
});
