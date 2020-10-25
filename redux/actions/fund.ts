import {
  ReduxState,
  CreateFund,
  UpdateFund,
  DeleteFund,
  RemoveFund,
} from "../types";

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
export function deleteFund(state: ReduxState, action: DeleteFund) {
  const { id } = action;
  const funds = state.funds;
  const fund = state.funds[id];
  return {
    ...state,
    funds: {
      ...funds,
      [id]: {
        ...fund,
        deleted: true,
      },
    },
  };
}

export function removeFund(state: ReduxState, action: RemoveFund) {
  const { id } = action;
  delete state.funds[id];
  return {
    ...state,
  };
}
