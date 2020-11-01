import { randomBytes, randomInt } from "crypto";
import { BudgetItem, Fund, User } from "../types";

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
  category: randomString(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const randomIncome: (fund: string) => BudgetItem = (fund) => ({
  id: randomString(),
  name: randomString(),
  fund,
  amount: randomInt(0, 100),
  type: "income",
  category: randomString(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
