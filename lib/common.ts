import { DateTime } from "luxon";
import { randomBytes } from "crypto";
import { BudgetItem, Fund, User } from "../types";

export function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

export const budgetItemDateFormat = (timestamp: number) =>
  DateTime.fromMillis(timestamp).toISODate();

export const budgetItemDateParse = (isoDate: string) =>
  DateTime.fromISO(isoDate).toUTC().toMillis();

export const getNullUser = (): User => ({
  email: null,
  username: null,
  password: null,
  authenticated: false,
  authenticationToken: null,
  loginToken: null,
  resetToken: null,
  funds: [],
  budgetItems: [],
});

export const randomString = () => randomBytes(8).toString("hex");

export const randomFund: () => Fund = () => ({
  id: randomString(),
  name: randomString(),
  amount: getRandomInt(100),
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const randomExpense: (fund: string) => BudgetItem = (fund) => ({
  id: randomString(),
  name: randomString(),
  fund,
  amount: getRandomInt(100),
  type: "expense",
  date: Date.now(),
  category: randomString(),
  description: randomString(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const randomIncome: (fund: string) => BudgetItem = (fund) => ({
  id: randomString(),
  name: randomString(),
  fund,
  amount: getRandomInt(100),
  type: "income",
  date: Date.now(),
  category: randomString(),
  description: randomString(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
