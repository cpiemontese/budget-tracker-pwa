import { Logger } from "pino";
import { Transporter } from "nodemailer";
import { Db, MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

type NextApiRequestWithDB = NextApiRequest & { db: Db; dbClient: MongoClient };
type NextApiRequestWithTransporter = NextApiRequest & {
  transporter: Transporter;
};
type NextApiRequestWithLogger = NextApiRequest & { logger: Logger };

export type {
  NextApiRequestWithDB,
  NextApiRequestWithTransporter,
  NextApiRequestWithLogger,
};
