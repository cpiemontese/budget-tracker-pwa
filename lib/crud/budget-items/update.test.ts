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

describe("returns 400 if user od budget items is not found", () => {
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
