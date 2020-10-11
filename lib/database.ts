import { MongoClient } from "mongodb";
import env from "./env"

const localEnv = env();

const client = new MongoClient(localEnv.db.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let using = 0;

export async function getDb() {
  using += 1;

  if (!client.isConnected()) await client.connect();

  return client.db(localEnv.db.name);
}

let timeoutHandle: NodeJS.Timeout = null
export function closeDb() {
  using -= 1;

  if (timeoutHandle !== null) {
    clearTimeout(timeoutHandle);
  }

  timeoutHandle = setTimeout(async() => {
    if (using <= 0) {
      await client.close();
    }
  }, localEnv.db.maxIdlePeriod)
}