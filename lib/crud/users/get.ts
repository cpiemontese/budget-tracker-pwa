import env from "../../env";
import logger from "../../logger";
import { closeDb, getDb } from "../../database";
import { User } from "../../../types";

const localEnv = env();
export async function get(email: string): Promise<User> {
  if (email === null) {
    return null;
  }

  const db = await getDb();
  const log = logger();
  const usersCollection = db.collection(localEnv.db.collections.users);

  let user: User = null;
  try {
    user = await usersCollection.findOne({ email });
  } catch (error) {
    log.error(
      { error: error.message },
      "get user - error on user find"
    );
    return null;
  } finally {
    closeDb();
  }

  // no user or fund found
  if (user === null || user === undefined) {
    return null;
  }

  return user;
}
