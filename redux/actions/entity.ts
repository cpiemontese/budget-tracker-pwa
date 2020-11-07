import { amountToValue } from "../../lib/crud/budget-items/common";
import {
  ReduxState,
  CreateEntity,
  UpdateEntity,
  DeleteFund,
  RemoveEntity,
  DeleteBudgetItem,
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

  if (entityName === "budgetItems") {
    const oldFund = state.budgetItems[id].fund;
    const oldType = state.budgetItems[id].type;
    const oldAmount = state.budgetItems[id].amount;

    const newFund = data["fund"] as string;
    const newType = data["type"] as string;
    const newAmount = data["amount"] as number;

    state.funds[oldFund].amount -= amountToValue(oldAmount, oldType);
    state.funds[newFund].amount += amountToValue(newAmount, newType);
  }

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

export function deleteBudgetItem(state: ReduxState, action: DeleteBudgetItem) {
  const { id } = action;

  const funds = state.funds;
  const budgetItems = state.budgetItems;

  const itemToDelete = budgetItems[id];
  const linkedFund = funds[budgetItems[id].fund];

  return {
    ...state,
    funds: {
      ...funds,
      [itemToDelete.fund]: {
        ...linkedFund,
        amount:
          linkedFund.amount -
          amountToValue(itemToDelete.amount, itemToDelete.type),
      },
    },
    budgetItems: {
      [id]: {
        ...itemToDelete,
        deleted: true,
      },
    },
  };
}

export function removeEntity(state: ReduxState, action: RemoveEntity) {
  const { entityName, id } = action;
  return {
    ...state,
    [entityName]: Object.keys(state[entityName]).reduce((newEntities, key) => {
      if (key !== id) {
        newEntities[key] = state[entityName][key];
      }
      return newEntities;
    }, {}),
  };
}
