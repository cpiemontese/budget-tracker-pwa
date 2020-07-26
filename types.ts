import { Db, MongoClient } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'

type NextApiRequestWithDB = NextApiRequest & { db: Db, dbClient: MongoClient }

export type { NextApiRequestWithDB }