import { CreateFund, ReduxState, UpdateFund } from "../types";

export function createFund(state: ReduxState, action: CreateFund) {
  const funds = state.funds;
  const { id, name, amount } = action;
  return {
    ...state,
    funds: {
      ...funds,
      [id]: {
        id,
        name,
        amount,
        synced: false,
        deleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    },
  };
}

export function updateFund(state: ReduxState, action: UpdateFund) {
  const { id, name, amount } = action;
  const funds = state.funds;
  const fund = state.funds[id];
  return {
    ...state,
    funds: {
      ...funds,
      [id]: {
        ...fund,
        name,
        amount,
        updatedAt: Date.now(),
      },
    },
  };
}
