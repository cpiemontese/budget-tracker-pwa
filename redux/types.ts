import { BudgetItem, Fund, User } from "../types";

// User
export const USER_REQUEST = "user/request";
export const USER_RECEIVE = "user/receive";
export const USER_ERROR = "user/error";

// Fund
export const CREATE_FUND = "fund/create";
export const UPDATE_FUND = "fund/update";

// Sync
export const SYNC_REQUEST = "sync/request";
export const SYNC_SUCCESS = "sync/success";
export const SYNC_FAILURE = "sync/failure";

type ReduxFund = Fund & {
  synced: boolean;
  deleted: boolean;
};

type FundsMap = {
  [id: string]: ReduxFund;
};

type BudgetItemsMap = {
  [id: string]: BudgetItem;
};

type ReduxState = {
  fetching: boolean;
  syncing: boolean;
  lastSyncFailed: boolean;
  logged: boolean;
  email: string;
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
  name: string;
  amount: number;
}

interface CreateFund {
  type: typeof CREATE_FUND;
  name: string;
  amount: number;
}

interface SyncRequest {
  type: typeof SYNC_REQUEST;
}

interface SyncSuccess {
  type: typeof SYNC_SUCCESS;
}

interface SyncFailure {
  type: typeof SYNC_FAILURE;
}

type Action =
  | UserRequest
  | UserReceive
  | UserError
  | UpdateFund
  | CreateFund
  | SyncRequest
  | SyncSuccess
  | SyncFailure;

export type { Action, ReduxState };
