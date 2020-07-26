import nextConnect, { RequestHandler, NextHandler } from 'next-connect';
import { MongoClient } from 'mongodb';
import { NextApiRequestWithDB } from '../types'
import { NextApiResponse } from 'next';

const client = new MongoClient(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function database(req: NextApiRequestWithDB, _res: NextApiResponse, next: NextHandler) {
  if (!client.isConnected()) await client.connect();
  req.dbClient = client;
  req.db = client.db(process.env.DB_NAME);
  return next();
}

const middleware = nextConnect();

middleware.use(database);

export default middleware;