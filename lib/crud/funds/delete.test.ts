import pino from "pino";
import { randomBytes } from "crypto";
import { MongoClient } from "mongodb";
import { createMocks } from "node-mocks-http";

import { deleteHandler } from "./delete";

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

  const response = await deleteHandler(req, res);

  expect(response.statusCode).toEqual(400);
});

test("returns 201 if fund is deleted", async () => {
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

  const idToDelete = randomString();
  await collection.insertOne({
    email,
    funds: [
      {
        id: randomString(),
        name: "some other fund",
        amount: 200,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: idToDelete,
        name: "fund to delete",
        amount: 1020.93,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
  });

  const { req, res } = createMocks({
    method: "DELETE",
    query: {
      email,
      id: idToDelete,
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
    const response = await deleteHandler(req, res);

    expect(response.statusCode).toEqual(201);

    const user: User = await collection.findOne({ email });

    expect(user.funds.length).toBe(1);
    expect(user.funds.find(({ id }) => id === idToDelete)).toBe(undefined);
  } finally {
    await db.dropDatabase();
    await mongoClient.close();
  }
});
