import { MongoClient } from "mongodb";
import env from "./env"

const localEnv = env();

let cachedClient: MongoClient = null
let using = 0;

export async function getDb() {
  using += 1;

  if (cachedClient) {
    return cachedClient.db(localEnv.db.name);
  }

  cachedClient = await MongoClient.connect(localEnv.db.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  return cachedClient.db(localEnv.db.name);
}

let timeoutHandle: NodeJS.Timeout = null
export function closeDb() {
  using -= 1;

  if (timeoutHandle !== null) {
    clearTimeout(timeoutHandle);
  }

  timeoutHandle = setTimeout(async() => {
    if (using <= 0) {
      await cachedClient.close();
    }
  }, localEnv.db.maxIdlePeriod)
}