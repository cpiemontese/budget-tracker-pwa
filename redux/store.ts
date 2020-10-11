import { useMemo } from "react";
import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import {
  Action,
  ReduxState,
  UPDATE_FUND,
  USER_ERROR,
  USER_RECEIVE,
  USER_REQUEST,
} from "../redux/types";

let store;

const initialState: ReduxState = {
  logged: false,
  fetching: false,
  funds: {},
  budgetItems: {},
};

const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case UPDATE_FUND: {
      const { id, updates } = action;
      const funds = state.funds;
      const fund = state.funds[id];
      return {
        ...state,
        funds: {
          ...funds,
          [id]: {
            ...fund,
            ...updates,
          },
        },
      };
    }
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
      const funds = action.user.funds;
      const budgetItems = action.user.budgetItems;

      return {
        ...state,
        logged: true,
        fetching: false,
        funds: Object.keys(funds).reduce((fundsMap, fundKey) => {
          fundsMap[fundKey] = funds[fundKey];
          return fundsMap;
        }, {}),
        budgetItems: Object.keys(budgetItems).reduce(
          (budgetItemsMap, budgetItemKey) => {
            budgetItemsMap[budgetItemKey] = funds[budgetItemKey];
            return budgetItemsMap;
          },
          {}
        ),
      };
    }
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
