import { useMemo } from "react";
import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";

import {
  Action,
  ReduxState,
  SYNC,
  SYNC_FAILURE,
  SYNC_REQUEST,
  SYNC_SUCCESS,
  CREATE_FUND,
  UPDATE_FUND,
  USER_ERROR,
  USER_RECEIVE,
  USER_REQUEST,
} from "../redux/types";

import { createFund, updateFund } from "./actions/fund";
import { sync } from "./actions/sync";

let store;

const initialState: ReduxState = {
  fetching: false,
  syncing: false,
  lastSyncFailed: false,
  logged: false,
  email: null,
  funds: {},
  budgetItems: {},
};

const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case CREATE_FUND:
      return createFund(state, action);
    case UPDATE_FUND:
      return updateFund(state, action);
    case USER_REQUEST:
      return {
        ...state,
        fetching: true,
      };
    case USER_ERROR:
      return {
        ...state,
        fetching: false,
      };
    case USER_RECEIVE: {
      const { funds, budgetItems } = state;
      const userFunds = action.user.funds;
      const userBudgetItems = action.user.budgetItems;

      return {
        ...state,
        logged: action.user.email !== null,
        fetching: false,
        email: action.user.email,
        funds: {
          ...funds,
          ...Object.keys(userFunds).reduce((fundsMap, fundKey) => {
            fundsMap[fundKey] = userFunds[fundKey];
            return fundsMap;
          }, {}),
        },
        budgetItems: {
          ...budgetItems,
          ...Object.keys(userBudgetItems).reduce(
            (budgetItemsMap, budgetItemKey) => {
              budgetItemsMap[budgetItemKey] = userFunds[budgetItemKey];
              return budgetItemsMap;
            },
            {}
          ),
        },
      };
    }
    case SYNC:
      return sync(state, action);
    case SYNC_REQUEST:
      return {
        ...state,
        syncing: true,
        lastSyncFailed: false,
      };
    case SYNC_SUCCESS:
      return {
        ...state,
        syncing: false,
        lastSyncFailed: false,
      };
    case SYNC_FAILURE:
      return {
        ...state,
        syncing: false,
        lastSyncFailed: true,
      };
    default:
      return state;
  }
};

function initStore(preloadedState = initialState) {
  return createStore(
    reducer,
    preloadedState,
    composeWithDevTools(applyMiddleware())
  );
}

export const initializeStore = (preloadedState: ReduxState) => {
  let _store = store ?? initStore(preloadedState);

  // After navigating to a page with an initial Redux state, merge that state
  // with the current state in the store, and create a new store
  if (preloadedState && store) {
    _store = initStore({
      ...preloadedState,
      ...store.getState(),
    });
    // Reset the current store
    store = undefined;
  }

  // For SSG and SSR always create a new store
  if (typeof window === "undefined") return _store;
  // Create the store once in the client
  if (!store) store = _store;

  return _store;
};

export function useStore(initialState: ReduxState) {
  const store = useMemo(() => initializeStore(initialState), [initialState]);
  return store;
}
