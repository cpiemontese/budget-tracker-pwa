import { Logger } from "pino";
import { Transporter } from "nodemailer";
import { Collection } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

type NextApiRequestWithDB = NextApiRequest & { usersCollection: Collection };
type NextApiRequestWithTransporter = NextApiRequest & {
  transporter: Transporter;
};
type NextApiRequestWithLogger = NextApiRequest & { logger: Logger };
type NextApiRequestWithEnv = NextApiRequest & {
  localEnv: {
    app: { name: string; host: string };
    loginCookie: { name: string; maxAge: number };
    logLevel: string;
    mailerName: string;
    smtp: { host: string; user: string; password: string };
    resetTokenMaxAge: number;
  };
};

type Token = {
  value: string;
  expiration: number;
};

type User = {
  email: string;
  username: string;
  password: string;
  authenticated: boolean;
  authenticationToken: string;
  loginToken: Token;
  resetToken: Token;
};

export type {
  User,
  NextApiRequestWithDB,
  NextApiRequestWithTransporter,
  NextApiRequestWithLogger,
  NextApiRequestWithEnv,
};
