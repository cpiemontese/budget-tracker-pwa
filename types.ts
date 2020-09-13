import { Logger } from "pino";
import { Transporter } from "nodemailer";
import { Collection } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

type NextApiRequestWithDB = NextApiRequest & { usersCollection: Collection };
type NextApiRequestWithTransporter = NextApiRequest & {
  transporter: Transporter;
};
type NextApiRequestWithLogger = NextApiRequest & { logger: Logger };

type User = {
  email: string;
  username: string;
  password: string;
  authenticated: boolean;
  authenticationToken: string;
};

export type {
  User,
  NextApiRequestWithDB,
  NextApiRequestWithTransporter,
  NextApiRequestWithLogger,
};
