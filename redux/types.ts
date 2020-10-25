import { BudgetItem, Fund, User } from "../types";

// User
export const USER_REQUEST = "user/request";
export const USER_RECEIVE = "user/receive";
export const USER_ERROR = "user/error";

// Fund
export const CREATE_FUND = "fund/create";
export const UPDATE_FUND = "fund/update";
export const DELETE_FUND = "fund/delete";
export const REMOVE_FUND = "fund/remove";

// Sync
export const SYNC = "sync";
export const SYNC_REQUEST = "sync/request";
export const SYNC_SUCCESS = "sync/success";
export const SYNC_FAILURE = "sync/failure";

type ReduxFund = Fund & {
  synced: boolean;
  deleted: boolean;
};

type ReduxBudgetItem = BudgetItem & {
  synced: boolean;
  deleted: boolean;
};

type FundsMap = {
  [id: string]: ReduxFund;
};

type BudgetItemsMap = {
  [id: string]: ReduxBudgetItem;
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

interface CreateFund {
  type: typeof CREATE_FUND;
  id: string;
  name: string;
  amount: number;
}

interface UpdateFund {
  type: typeof UPDATE_FUND;
  id: string;
  name: string;
  amount: number;
}

interface DeleteFund {
  type: typeof DELETE_FUND;
  id: string;
}

interface RemoveFund {
  type: typeof REMOVE_FUND;
  id: string;
}

interface SyncRequest {
  type: typeof SYNC_REQUEST;
}

interface Sync {
  type: typeof SYNC;
  localId: string; // id of fund or budget item saved locally
  backendId: string; // id of fund or budget item from backend
  entityName: "funds" | "budgetItems";
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
  | CreateFund
  | UpdateFund
  | DeleteFund
  | RemoveFund
  | Sync
  | SyncRequest
  | SyncSuccess
  | SyncFailure;

export type {
  Action,
  ReduxState,
  Sync,
  CreateFund,
  UpdateFund,
  DeleteFund,
  RemoveFund,
};
