import nextConnect from 'next-connect'
import { NextApiResponse } from 'next'
import { NextApiRequestWithDB } from '../../types'
import middleware from '../../middleware/database'

const handler = nextConnect();

handler.use(middleware);

handler.get(async (req: NextApiRequestWithDB, res: NextApiResponse) => {
  let doc = await req.db.collection('hello').findOne({})
  res.json(doc)
});

export default handler;
