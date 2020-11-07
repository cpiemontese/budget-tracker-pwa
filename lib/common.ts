import { format } from "date-fns";
import { randomBytes, randomInt } from "crypto";
import { BudgetItem, Fund, User } from "../types";

export const budgetItemDateFormat = (timestamp: number) =>
  format(timestamp, "yyyy-MM-dd");

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
  amount: randomInt(0, 100),
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const randomExpense: (fund: string) => BudgetItem = (fund) => ({
  id: randomString(),
  name: randomString(),
  fund,
  amount: randomInt(0, 100),
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
  amount: randomInt(0, 100),
  type: "income",
  date: Date.now(),
  category: randomString(),
  description: randomString(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
