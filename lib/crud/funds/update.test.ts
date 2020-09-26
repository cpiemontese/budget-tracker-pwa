import pino from "pino";
import { randomBytes } from "crypto";
import { MongoClient } from "mongodb";
import { createMocks } from "node-mocks-http";

import { updateHandler } from "./update";

import getEnv from "../../test-env";
import { User } from "../../../types";

const randomString = () => randomBytes(8).toString("hex");

const LOCAL_ENV = getEnv();

const MONGODB_URI = "mongodb://localhost:27017";

const logger = pino({ level: "debug" });

test("returns 400 if properties are missing from query", async () => {
  const { req, res } = createMocks({
    method: "PATCH",
    query: null,
  });

  req.logger = logger;

  req.localEnv = LOCAL_ENV;

  const response = await updateHandler(req, res);

  expect(response.statusCode).toEqual(400);
});

describe("returns 201 if fund is updated", () => {
  const mongoClient = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const dbName = randomString();
  const collectionName = randomString();
  const email = "test@gmail.com";

  beforeAll(async (done) => {
    await mongoClient.connect();
    await mongoClient.db(dbName).collection(collectionName).insertOne({
      email,
      funds: [],
    });
    done();
  });
  afterAll(async (done) => {
    await mongoClient.db(dbName).dropDatabase();
    await mongoClient.close();
    done();
  });

  test("name update", async () => {
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    const id = randomString();
    const amount = 100.0;
    const oldName = "oldName";
    const createdAt = Date.now();

    await collection.updateOne(
      { email },
      {
        $push: {
          funds: {
            id,
            name: oldName,
            amount,
            createdAt,
            updatedAt: createdAt,
          },
        },
      }
    );

    await collection.updateOne(
      { email },
      {
        $push: {
          funds: {
            id: randomString(),
            name: "some other fund",
            amount: 100.5,
            createdAt,
            updatedAt: createdAt,
          },
        },
      }
    );

    const newName = "newName";
    const { req, res } = createMocks({
      method: "PATCH",
      query: {
        email,
        id,
      },
      body: {
        name: newName,
      },
    });

    req.logger = logger;

    req.usersCollection = collection;

    req.localEnv = LOCAL_ENV;

    const response = await updateHandler(req, res);

    expect(response.statusCode).toEqual(201);

    const user: User = await collection.findOne({ email });

    const updatedFund = user.funds.find(({ id: fundId }) => fundId === id);

    expect(updatedFund).toMatchObject({
      name: newName,
      amount,
    });
    expect(updatedFund.updatedAt).toBeGreaterThan(updatedFund.createdAt);
  });

  test("amount update", async () => {
    const email = "test@gmail.com";

    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    const id = randomString();
    const oldAmount = 100.0;
    const name = "name";
    const createdAt = Date.now();

    await collection.updateOne(
      { email },
      {
        $push: {
          funds: {
            id,
            name,
            amount: oldAmount,
            createdAt,
            updatedAt: createdAt,
          },
        },
      }
    );

    await collection.updateOne(
      { email },
      {
        $push: {
          funds: {
            id: randomString(),
            name: "some other fund",
            amount: 100.5,
            createdAt,
            updatedAt: createdAt,
          },
        },
      }
    );

    const newAmount = 127.53;
    const { req, res } = createMocks({
      method: "PATCH",
      query: {
        email,
        id,
      },
      body: {
        amount: newAmount,
      },
    });

    req.logger = logger;

    req.usersCollection = collection;

    req.localEnv = LOCAL_ENV;

    const response = await updateHandler(req, res);

    expect(response.statusCode).toEqual(201);

    const user: User = await collection.findOne({ email });

    const updatedFund = user.funds.find(({ id: fundId }) => fundId === id);

    expect(updatedFund).toMatchObject({
      name,
      amount: newAmount,
    });
    expect(updatedFund.updatedAt).toBeGreaterThan(updatedFund.createdAt);
  });

  test("combined update", async () => {
    const email = "test@gmail.com";

    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    const id = randomString();
    const oldAmount = 100.0;
    const oldName = "oldName";
    const createdAt = Date.now();

    await collection.updateOne(
      { email },
      {
        $push: {
          funds: {
            id,
            name: oldName,
            amount: oldAmount,
            createdAt,
            updatedAt: createdAt,
          },
        },
      }
    );

    await collection.updateOne(
      { email },
      {
        $push: {
          funds: {
            id: randomString(),
            name: "some other fund",
            amount: 100.5,
            createdAt,
            updatedAt: createdAt,
          },
        },
      }
    );

    const newName = "newName";
    const newAmount = 127.53;
    const { req, res } = createMocks({
      method: "PATCH",
      query: {
        email,
        id,
      },
      body: {
        name: newName,
        amount: newAmount,
      },
    });

    req.logger = logger;

    req.usersCollection = collection;

    req.localEnv = LOCAL_ENV;

    const response = await updateHandler(req, res);

    expect(response.statusCode).toEqual(201);

    const user: User = await collection.findOne({ email });

    const updatedFund = user.funds.find(({ id: fundId }) => fundId === id);

    expect(updatedFund).toMatchObject({
      name: newName,
      amount: newAmount,
    });
    expect(updatedFund.updatedAt).toBeGreaterThan(updatedFund.createdAt);
  });
});
