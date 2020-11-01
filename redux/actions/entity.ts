import { amountToValue } from "../../lib/crud/budget-items/common";
import {
  ReduxState,
  CreateEntity,
  UpdateEntity,
  DeleteFund,
  RemoveEntity,
} from "../types";

export function createEntity(state: ReduxState, action: CreateEntity) {
  const { entityName, id, data } = action;
  const entities = state[entityName];

  if (entityName === "budgetItems") {
    const fundId = data["fund"] as string;
    const amount = data["amount"] as number;
    const type = data["type"] as string;
    state.funds[fundId].amount += amountToValue(amount, type);
  }

  return {
    ...state,
    [entityName]: {
      ...entities,
      [id]: {
        id,
        name,
        ...data,
        synced: false,
        deleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    },
  };
}

export function updateEntity(state: ReduxState, action: UpdateEntity) {
  const { entityName, id, data } = action;
  const entities = state[entityName];
  const entity = state[entityName][id];
  return {
    ...state,
    [entityName]: {
      ...entities,
      [id]: {
        ...entity,
        ...data,
        updatedAt: Date.now(),
      },
    },
  };
}

export function deleteFund(state: ReduxState, action: DeleteFund) {
  const { id, substituteId } = action;

  const funds = state.funds;
  const budgetItems = state.budgetItems;

  let fundAmountUpdate = 0.0;
  const updateBudgetItems = Object.keys(budgetItems).map((key) => {
    if (budgetItems[key].fund === id) {
      fundAmountUpdate += amountToValue(
        budgetItems[key].amount,
        budgetItems[key].type
      );
      return {
        ...budgetItems[key],
        ...(substituteId === "delete-all"
          ? {
              deleted: true,
            }
          : {
              fund: substituteId,
            }),
      };
    }
    return budgetItems[key];
  });

  return substituteId === "delete-all"
    ? {
        ...state,
        budgetItems: updateBudgetItems,
        funds: {
          ...funds,
          [id]: {
            ...funds[id],
            deleted: true,
          },
        },
      }
    : {
        ...state,
        budgetItems: updateBudgetItems,
        funds: {
          ...funds,
          [id]: {
            ...funds[id],
            deleted: true,
          },
          [substituteId]: {
            ...funds[substituteId],
            amount: funds[substituteId].amount + fundAmountUpdate,
          },
        },
      };
}

export function removeEntity(state: ReduxState, action: RemoveEntity) {
  const { entityName, id } = action;
  delete state[entityName][id];
  return {
    ...state,
  };
}
