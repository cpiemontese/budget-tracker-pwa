import { Logger } from "pino";
import { Transporter } from "nodemailer";
import { Collection } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

type NextApiRequestWithDB = NextApiRequest & { usersCollection: Collection };
type NextApiRequestWithTransporter = NextApiRequest & {
  transporter: Transporter;
};
type NextApiRequestWithLogger = NextApiRequest & { logger: Logger };

type LocalEnv = {
  app: { name: string; host: string };
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
  category: string;
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

type FundsMap = {
  [id: string]: Fund
}

type BudgetItemsMap = {
  [id: string]: BudgetItem
}

type ReduxState = {
  funds: FundsMap,
  budgetItems: BudgetItemsMap,
}

export type {
  User,
  NextApiRequestWithDB,
  NextApiRequestWithTransporter,
  NextApiRequestWithLogger,
  NextApiRequestWithEnv,
  LocalEnv,
  ReduxState,
  FundsMap
};
