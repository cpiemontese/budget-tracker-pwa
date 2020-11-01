import { BudgetItem, Fund, User } from "../types";

// User
export const USER_REQUEST = "user/request";
export const USER_RECEIVE = "user/receive";
export const USER_ERROR = "user/error";

// Fund
export const CREATE_ENTITY = "entity/create";
export const UPDATE_ENTITY = "entity/update";
export const DELETE_FUND = "entity/delete/fund";
export const DELETE_BUDGET_ITEM = "entity/delete/budgetItem";
export const REMOVE_ENTITY = "entity/remove";

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

interface CreateEntity {
  type: typeof CREATE_ENTITY;
  entityName: "funds" | "budgetItems";
  id: string;
  data: object;
}

interface UpdateEntity {
  type: typeof UPDATE_ENTITY;
  entityName: "funds" | "budgetItems";
  id: string;
  data: object;
}

interface DeleteFund {
  type: typeof DELETE_FUND;
  id: string;
  substituteId: string;
}

interface DeleteBudgetItem {
  type: typeof DELETE_BUDGET_ITEM;
  id: string;
}

interface RemoveEntity {
  type: typeof REMOVE_ENTITY;
  entityName: "funds" | "budgetItems";
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
  | CreateEntity
  | UpdateEntity
  | DeleteFund
  | DeleteBudgetItem
  | RemoveEntity
  | Sync
  | SyncRequest
  | SyncSuccess
  | SyncFailure;

export type {
  Action,
  ReduxState,
  ReduxFund,
  ReduxBudgetItem,
  Sync,
  CreateEntity,
  UpdateEntity,
  DeleteFund,
  DeleteBudgetItem,
  RemoveEntity,
  FundsMap,
  BudgetItemsMap,
};
