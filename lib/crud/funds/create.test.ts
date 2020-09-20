import { createMocks } from "node-mocks-http";

import { create } from "./create";

import getEnv from "../../test-env";

const LOCAL_ENV = getEnv();

test("returns 400 if properties are missing from query", async () => {
  const { req, res } = createMocks({
    method: "POST",
    query: null,
  });

  req.logger = {
    debug() {},
    error() {},
  };

  req.localEnv = LOCAL_ENV;

  const response = await create(req, res);

  expect(response.statusCode).toEqual(400);
});

test("returns 201 if fund is created", async () => {
  const email = "test@gmail.com";
  const name = "fund";
  const amount = 100.0;

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

  req.logger = {
    debug() {},
    error() {},
  };

  let receivedFilter = null;
  let receivedUpdate = null;
  req.usersCollection = {
    async updateOne(filter, update) {
      receivedFilter = filter;
      receivedUpdate = update;
    },
  };

  req.localEnv = LOCAL_ENV;

  const response = await create(req, res);

  expect(response.statusCode).toEqual(201);
  expect(receivedFilter).toEqual({ email });
  expect(receivedUpdate).toMatchObject({
    $push: {
      funds: {
        name,
        amount,
      },
    },
  });
});
