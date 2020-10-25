import { User } from "../../types";
import {
  CREATE_FUND,
  DELETE_FUND,
  REMOVE_FUND,
  SYNC,
  SYNC_FAILURE,
  SYNC_REQUEST,
  SYNC_SUCCESS,
  UPDATE_FUND,
  USER_ERROR,
  USER_RECEIVE,
  USER_REQUEST,
} from "../types";

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

export const createFund = (id: string, name: string, amount: number) => ({
  type: CREATE_FUND,
  id,
  name,
  amount,
});

export const updateFund = (id: string, name: string, amount: number) => ({
  type: UPDATE_FUND,
  id,
  name,
  amount,
});

export const deleteFund = (id: string) => ({
  type: DELETE_FUND,
  id,
});

export const removeFund = (id: string) => ({
  type: REMOVE_FUND,
  id,
});

export const sync = (
  localId: string,
  backendId: string,
  entityName: "funds" | "budgetItems"
) => ({
  type: SYNC,
  localId,
  backendId,
  entityName,
});

export const syncRequest = {
  type: SYNC_REQUEST,
};

export const syncSuccess = {
  type: SYNC_SUCCESS,
};

export const syncFailure = {
  type: SYNC_FAILURE,
};
