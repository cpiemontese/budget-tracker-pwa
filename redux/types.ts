import { BudgetItem, Fund, User } from "../types";

// User
export const USER_REQUEST = "user/request";
export const USER_RECEIVE = "user/receive";
export const USER_ERROR = "user/error";

// Fund
export const UPDATE_FUND = "fund/update";

type FundsMap = {
  [id: string]: Fund;
};

type BudgetItemsMap = {
  [id: string]: BudgetItem;
};

type ReduxState = {
  logged: boolean;
  fetching: boolean;
  funds: FundsMap;
  budgetItems: BudgetItemsMap;
};

interface UserRequest {
  type: typeof USER_REQUEST;
}

interface UserReceive {
  type: typeof USER_RECEIVE;
  user: User;
}

interface UserError {
  type: typeof USER_ERROR;
}

interface UpdateFund {
  type: typeof UPDATE_FUND;
  id: string;
  updates: { [name: string]: any };
}

type Action = UserRequest | UserReceive | UserError | UpdateFund;

export type { Action, ReduxState };
