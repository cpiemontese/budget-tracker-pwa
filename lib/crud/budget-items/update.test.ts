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

    const response = await updateHandler(req, res);

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

    const response = await updateHandler(req, res);

    expect(response.statusCode).toEqual(400);
  });
});

describe("returns 204 if everything is updated correctly", () => {
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
      budgetItems: [],
    });
    done();
  });
  afterAll(async (done) => {
    await mongoClient.db(dbName).dropDatabase();
    await mongoClient.close();
    done();
  });

  beforeEach(async (done) => {
    await mongoClient
      .db(dbName)
      .collection(collectionName)
      .updateOne(
        {
          email,
        },
        {
          $set: {
            funds: [],
            budgetTimes: [],
          },
        }
      );
    done();
  });

  test("expense to income", async () => {
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    const fundId = randomString();
    const fundAmount = 100;

    const budgetItemId = randomString();
    const budgetItemAmount = 50;

    const now = Date.now();

    await collection.updateOne(
      {
        email,
      },
      {
        $push: {
          funds: {
            $each: [
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
          },
          budgetItems: {
            id: budgetItemId,
            name: "name",
            type: "expense",
            amount: budgetItemAmount,
            fund: fundId,
            category: "category",
            description: "description",
            createdAt: now,
            updatedAt: now,
          },
        },
      }
    );

    const { req, res } = createMocks({
      method: "PATCH",
      query: {
        email,
        id: budgetItemId,
      },
      body: {
        type: "income",
      },
    });

    req.logger = logger;
    req.usersCollection = collection;
    req.localEnv = LOCAL_ENV;

    const response = await updateHandler(req, res);

    expect(response.statusCode).toEqual(204);

    const user: User = await collection.findOne({ email });
    const funds = user.funds;
    const budgetItems = user.budgetItems;

    const affectedFund = funds.find(({ id }) => id === fundId);

    expect(affectedFund).toMatchObject({
      id: fundId,
      name: "some fund",
      amount: fundAmount + 2 * budgetItemAmount,
    });

    const affectedBudgetItem = budgetItems.find(
      ({ id }) => id === budgetItemId
    );

    expect(affectedBudgetItem).toMatchObject({
      id: budgetItemId,
      name: "name",
      type: "income",
      amount: budgetItemAmount,
      fund: fundId,
      category: "category",
      description: "description",
    });

    expect(affectedBudgetItem.createdAt).toBeLessThan(
      affectedBudgetItem.updatedAt
    );
  });

  test("amount change", async () => {
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    const fundId = randomString();
    const fundAmount = 100;

    const budgetItemId = randomString();
    const oldBudgetItemAmount = 50;
    const newBudgetItemAmount = 100;

    const now = Date.now();

    await collection.updateOne(
      {
        email,
      },
      {
        $push: {
          funds: {
            $each: [
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
          },
          budgetItems: {
            id: budgetItemId,
            name: "name",
            type: "expense",
            amount: oldBudgetItemAmount,
            fund: fundId,
            date: now,
            category: "category",
            description: "description",
            createdAt: now,
            updatedAt: now,
          },
        },
      }
    );

    const { req, res } = createMocks({
      method: "PATCH",
      query: {
        email,
        id: budgetItemId,
      },
      body: {
        amount: newBudgetItemAmount,
      },
    });

    req.logger = logger;
    req.usersCollection = collection;
    req.localEnv = LOCAL_ENV;

    const response = await updateHandler(req, res);

    expect(response.statusCode).toEqual(204);

    const user: User = await collection.findOne({ email });
    const funds = user.funds;
    const budgetItems = user.budgetItems;

    const affectedFund = funds.find(({ id }) => id === fundId);

    expect(affectedFund).toMatchObject({
      id: fundId,
      name: "some fund",
      amount: fundAmount + oldBudgetItemAmount - newBudgetItemAmount,
    });

    const affectedBudgetItem = budgetItems.find(
      ({ id }) => id === budgetItemId
    );

    expect(affectedBudgetItem).toMatchObject({
      id: budgetItemId,
      name: "name",
      type: "expense",
      amount: newBudgetItemAmount,
      fund: fundId,
      date: now,
      category: "category",
      description: "description",
    });

    expect(affectedBudgetItem.createdAt).toBeLessThan(
      affectedBudgetItem.updatedAt
    );
  });

  test("fund change", async () => {
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    const oldFundId = randomString();
    const newFundId = randomString();
    const oldFundAmount = 100;
    const newFundAmount = 100;

    const budgetItemId = randomString();
    const amount = 50;

    const now = Date.now();

    await collection.updateOne(
      {
        email,
      },
      {
        $push: {
          funds: {
            $each: [
              {
                id: oldFundId,
                name: "some old fund",
                amount: oldFundAmount,
              },
              {
                id: newFundId,
                name: "some new fund",
                amount: newFundAmount,
              },
            ],
          },
          budgetItems: {
            id: budgetItemId,
            name: "name",
            type: "expense",
            amount: amount,
            fund: oldFundId,
            date: now,
            category: "category",
            description: "description",
            createdAt: now,
            updatedAt: now,
          },
        },
      }
    );

    const { req, res } = createMocks({
      method: "PATCH",
      query: {
        email,
        id: budgetItemId,
      },
      body: {
        fund: newFundId,
      },
    });

    req.logger = logger;
    req.usersCollection = collection;
    req.localEnv = LOCAL_ENV;

    const response = await updateHandler(req, res);

    expect(response.statusCode).toEqual(204);

    const user: User = await collection.findOne({ email });
    const funds = user.funds;
    const budgetItems = user.budgetItems;

    const oldFund = funds.find(({ id }) => id === oldFundId);
    const newFund = funds.find(({ id }) => id === newFundId);

    expect(oldFund).toMatchObject({
      id: oldFundId,
      name: "some old fund",
      amount: oldFundAmount + amount,
    });

    expect(newFund).toMatchObject({
      id: newFundId,
      name: "some new fund",
      amount: newFundAmount - amount,
    });

    const affectedBudgetItem = budgetItems.find(
      ({ id }) => id === budgetItemId
    );

    expect(affectedBudgetItem).toMatchObject({
      id: budgetItemId,
      name: "name",
      type: "expense",
      amount: amount,
      fund: newFundId,
      date: now,
      category: "category",
      description: "description",
    });

    expect(affectedBudgetItem.createdAt).toBeLessThan(
      affectedBudgetItem.updatedAt
    );
  });

  test("multiple changes", async () => {
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    const oldFundId = randomString();
    const newFundId = randomString();
    const oldFundAmount = 100;
    const newFundAmount = 100;

    const budgetItemId = randomString();
    const oldAmount = 50;
    const newAmount = 100;

    const now = Date.now();

    await collection.updateOne(
      {
        email,
      },
      {
        $push: {
          funds: {
            $each: [
              {
                id: oldFundId,
                name: "some old fund",
                amount: oldFundAmount,
              },
              {
                id: newFundId,
                name: "some new fund",
                amount: newFundAmount,
              },
            ],
          },
          budgetItems: {
            id: budgetItemId,
            name: "name",
            type: "expense",
            amount: oldAmount,
            fund: oldFundId,
            date: now,
            category: "category",
            description: "description",
            createdAt: now,
            updatedAt: now,
          },
        },
      }
    );

    const { req, res } = createMocks({
      method: "PATCH",
      query: {
        email,
        id: budgetItemId,
      },
      body: {
        type: "income",
        fund: newFundId,
        amount: newAmount,
      },
    });

    req.logger = logger;
    req.usersCollection = collection;
    req.localEnv = LOCAL_ENV;

    const response = await updateHandler(req, res);

    expect(response.statusCode).toEqual(204);

    const user: User = await collection.findOne({ email });
    const funds = user.funds;
    const budgetItems = user.budgetItems;

    const oldFund = funds.find(({ id }) => id === oldFundId);
    const newFund = funds.find(({ id }) => id === newFundId);

    expect(oldFund).toMatchObject({
      id: oldFundId,
      name: "some old fund",
      amount: oldFundAmount + oldAmount,
    });

    expect(newFund).toMatchObject({
      id: newFundId,
      name: "some new fund",
      amount: newFundAmount + newAmount,
    });

    const affectedBudgetItem = budgetItems.find(
      ({ id }) => id === budgetItemId
    );

    expect(affectedBudgetItem).toMatchObject({
      id: budgetItemId,
      name: "name",
      type: "income",
      amount: newAmount,
      fund: newFundId,
      date: now,
      category: "category",
      description: "description",
    });

    expect(affectedBudgetItem.createdAt).toBeLessThan(
      affectedBudgetItem.updatedAt
    );
  });
});
