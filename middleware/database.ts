import nextConnect, { NextHandler } from "next-connect";
import { MongoClient } from "mongodb";
import { NextApiRequestWithDB } from "../types";
import { NextApiResponse } from "next";

const client = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function database(
  req: NextApiRequestWithDB,
  _res: NextApiResponse,
  next: NextHandler
) {
  if (!client.isConnected()) await client.connect();
  const db = client.db(process.env.DB_NAME);
  req.usersCollection = db.collection(process.env.DB_USERS_COLLECTION);
  return next();
}

const middleware = nextConnect();

middleware.use(database);

export default middleware;
