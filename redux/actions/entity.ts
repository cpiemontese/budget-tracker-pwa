import {
  ReduxState,
  CreateEntity,
  UpdateEntity,
  DeleteEntity,
  RemoveEntity,
} from "../types";

export function createEntity(state: ReduxState, action: CreateEntity) {
  const { entityName, id, name, amount } = action;
  const entities = state[entityName];
  return {
    ...state,
    entitys: {
      ...entities,
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

export function updateEntity(state: ReduxState, action: UpdateEntity) {
  const { entityName, id, name, amount } = action;
  const entities = state;
  const entity = state[entityName][id];
  return {
    ...state,
    entitys: {
      ...entities,
      [id]: {
        ...entity,
        name,
        amount,
        updatedAt: Date.now(),
      },
    },
  };
}
export function deleteEntity(state: ReduxState, action: DeleteEntity) {
  const { entityName, id } = action;
  const entities = state[entityName];
  const entity = state[entityName][id];
  return {
    ...state,
    entitys: {
      ...entities,
      [id]: {
        ...entity,
        deleted: true,
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
