import { MongoClient } from "mongodb";
import env from "./env"

const localEnv = env();

const client = new MongoClient(localEnv.db.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export default async function database() {

  if (!client.isConnected()) await client.connect();
  return client.db(localEnv.db.name);
}