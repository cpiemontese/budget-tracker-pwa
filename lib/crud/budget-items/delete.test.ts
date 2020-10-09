import pino from "pino";
import { randomBytes } from "crypto";
import { MongoClient } from "mongodb";
import { createMocks } from "node-mocks-http";

import { deleteHandler as deleteHandler } from "./delete";

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

  const response = await deleteHandler(req, res);

  expect(response.statusCode).toEqual(400);
});

describe("returns 400 if user or budget items is not found", () => {
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

  test("user is not found", async () => {
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    const id = randomString();

    const { req, res } = createMocks({
      method: "PATCH",
      query: {
        email,
        id,
      },
    });

    req.logger = logger;
    req.usersCollection = collection;
    req.localEnv = LOCAL_ENV;

    const response = await deleteHandler(req, res);

    expect(response.statusCode).toEqual(400);
  });

  test("budget item is not found", async () => {
    const email = "test@gmail.com";

    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    const id = randomString();

    await collection.insertOne({ email, funds: [], budgetItems: [] });

    const { req, res } = createMocks({
      method: "PATCH",
      query: {
        email,
        id,
      },
      body: null,
    });

    req.logger = logger;
    req.usersCollection = collection;
    req.localEnv = LOCAL_ENV;

    const response = await deleteHandler(req, res);

    expect(response.statusCode).toEqual(400);
  });
});

test("returns 204 if budget item is deleted", async() => {
  const mongoClient = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const dbName = randomString();
  const collectionName = randomString();
  const email = "test@gmail.com";

  await mongoClient.connect();

  const db = mongoClient.db(dbName);
  const collection = db.collection(collectionName);

  const fundId = randomString();
  const fundAmount = 100;

  const budgetItemId = randomString();
  const budgetItemAmount = 50;

  const now = Date.now();

  await collection.insertOne({
    email,
    funds: [
      {
        id: fundId,
        name: "some fund",
        amount: fundAmount,
      },
      {
        id: randomString(),
        name: "some other fund",
        amount: 200,
      },
    ],
    budgetItems: [
      {
        id: budgetItemId,
        name: "item to delete",
        type: "expense",
        amount: budgetItemAmount,
        fund: fundId,
        category: "category",
        description: "description",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomString(),
        name: "item not to delete",
        type: "expense",
        amount: 200,
        fund: fundId,
        category: "category",
        description: "description",
        createdAt: now,
        updatedAt: now,
      }
    ],
  });
 
  const { req, res } = createMocks({
    method: "DELETE",
    query: {
      email,
      id: budgetItemId,
    },
  });

  req.logger = logger;
  req.usersCollection = collection;
  req.localEnv = LOCAL_ENV;

  try {
    const response = await deleteHandler(req, res);

    expect(response.statusCode).toEqual(204);
  
    const user: User = await collection.findOne({ email });
    const funds = user.funds;
    const budgetItems = user.budgetItems;

    expect(budgetItems.length).toBe(1)
    expect(funds.length).toBe(2)
  
    const affectedFund = funds.find(({ id }) => id === fundId);
  
    expect(affectedFund).toMatchObject({
      id: fundId,
      name: "some fund",
      amount: fundAmount + budgetItemAmount,
    });
  
    const affectedBudgetItem = budgetItems.find(
      ({ id }) => id === budgetItemId
    );
  
    expect(affectedBudgetItem).toBe(undefined) 
  } finally {
    await mongoClient.db(dbName).dropDatabase();
    await mongoClient.close();
  }
});
