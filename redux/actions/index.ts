import { User } from "../../types";

import {
  CREATE_ENTITY,
  DELETE_ENTITY,
  REMOVE_ENTITY,
  SYNC,
  SYNC_FAILURE,
  SYNC_REQUEST,
  SYNC_SUCCESS,
  UPDATE_ENTITY,
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

export const createEntity = (
  entityName: "funds" | "budgetItems",
  id: string,
  data: object
) => ({
  type: CREATE_ENTITY,
  entityName,
  id,
  data,
});

export const updateEntity = (
  entityName: "funds" | "budgetItems",
  id: string,
  data: object
) => ({
  type: UPDATE_ENTITY,
  entityName,
  id,
  data,
});

export const deleteEntity = (
  entityName: "funds" | "budgetItems",
  id: string,
  moveId: string
) => ({
  type: DELETE_ENTITY,
  entityName,
  id,
  moveId,
});

export const removeEntity = (
  entityName: "funds" | "budgetItems",
  id: string
) => ({
  type: REMOVE_ENTITY,
  entityName,
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
