import { randomBytes } from "crypto";
import { closeDb, getDb } from "../../database";
import env from "../../env";
import { get } from "./get";

test("returns null if email is null", async () => {
  const user = await get(null);
  expect(user).toBe(null);
});

test("returns null if user is not found", async () => {
  const user = await get("does not exist");
  expect(user).toBe(null);
});

test("returns 200 if user is found", async () => {
  const localEnv = env();

  const email = randomBytes(8).toString("hex");

  const db = await getDb();
  const usersCollection = db.collection(localEnv.db.collections.users);

  await usersCollection.insertOne({
    email,
    funds: [],
    budgetItems: []
  });

  const expectedUser = await usersCollection.findOne({ email });

  closeDb();

  const user = await get(email);
  expect(user).toMatchObject(expectedUser);
});