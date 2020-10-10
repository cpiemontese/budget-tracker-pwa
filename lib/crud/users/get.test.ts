import pino from "pino";
import { randomBytes } from "crypto";
import { MongoClient } from "mongodb";
import { createMocks } from "node-mocks-http";

import { getHandler } from "./get";

import getEnv from "../../test-env";
import { User } from "../../../types";

const randomString = () => randomBytes(8).toString("hex");

const LOCAL_ENV = getEnv();

const MONGODB_URI = "mongodb://localhost:27017";

const logger = pino({ level: "debug" });

test("returns 400 if properties are missing from query", async () => {
  const { req, res } = createMocks({
    method: "GET",
    query: null,
  });

  req.logger = logger;

  req.localEnv = LOCAL_ENV;

  const response = await getHandler(req, res);

  expect(response.statusCode).toEqual(400);
});

test("returns 404 if user is not found", async () => {
  const dbName = randomString();
  const collectionName = randomString();
  const mongoClient = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await mongoClient.connect();

  const { req, res } = createMocks({
    method: "GET",
    query: {
      email: 'does not matter',
    },  
  });

  
  req.logger = logger;
  
  req.localEnv = LOCAL_ENV;

  req.usersCollection = mongoClient.db(dbName).collection(collectionName);

  try {
    const response = await getHandler(req, res);
    expect(response.statusCode).toEqual(404);
  } finally {
    await mongoClient.close()
  }
});

test("returns 200 if user is found", async () => {
  const email = "test@gmail.com";

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
    budgetItems: []
  });

  const { req, res } = createMocks({
    method: "GET",
    query: {
      email,
    },
  });

  req.logger = logger;

  req.usersCollection = collection;

  req.localEnv = LOCAL_ENV;

  try {
    const response = await getHandler(req, res);
    expect(response.statusCode).toEqual(200);
  } finally {
    await db.dropDatabase();
    await mongoClient.close();
  }
});
