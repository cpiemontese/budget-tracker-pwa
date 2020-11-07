import { Logger } from "pino";
import { Collection } from "mongodb";
import { NextApiRequest } from "next";
import { Transporter } from "nodemailer";
import { Dispatch, SetStateAction } from "react";

type NextApiRequestWithDB = NextApiRequest & { usersCollection: Collection };
type NextApiRequestWithTransporter = NextApiRequest & {
  transporter: Transporter;
};
type NextApiRequestWithLogger = NextApiRequest & { logger: Logger };

type LocalEnv = {
  app: { name: string; host: string };
  db: {
    uri: string;
    name: string;
    maxIdlePeriod: number;
    collections: { [name: string]: string };
  };
  loginCookie: { name: string; maxAge: number };
  logLevel: string;
  mailerName: string;
  smtp: { host: string; user: string; password: string };
  resetTokenMaxAge: number;
};

type NextApiRequestWithEnv = NextApiRequest & {
  localEnv: LocalEnv;
};

type Token = {
  value: string;
  expiration: number;
};

type Fund = {
  id: string;
  name: string;
  amount: number;
  createdAt: number;
  updatedAt: number;
};

type BudgetItem = {
  id: string;
  name: string;
  fund: string;
  amount: number;
  type: "expense" | "income";
  date: number;
  category: string;
  description: string;
  createdAt: number;
  updatedAt: number;
};

type User = {
  email: string;
  username: string;
  password: string;
  authenticated: boolean;
  authenticationToken: string;
  loginToken: Token;
  resetToken: Token;
  funds: Array<Fund>;
  budgetItems: Array<BudgetItem>;
};

type Inputs = Array<{
  label: string;
  type: string;
  value: any;
  setter: Dispatch<SetStateAction<any>>;
}>;

export type {
  NextApiRequestWithDB,
  NextApiRequestWithTransporter,
  NextApiRequestWithLogger,
  NextApiRequestWithEnv,
  LocalEnv,
  User,
  Fund,
  BudgetItem,
  Inputs,
};
