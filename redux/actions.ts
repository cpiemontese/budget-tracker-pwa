import { User } from "../types";
import { CREATE_FUND, USER_ERROR, USER_RECEIVE, USER_REQUEST } from "./types";

export const userRequest = {
  type: USER_REQUEST,
};

export const userReceive = (user: User) => ({
  type: USER_RECEIVE,
  user,
});

export const userError = {
  type: USER_ERROR,
};

export const createFund = (name: string, amount: number) => ({
  type: CREATE_FUND,
  name,
  amount,
});
