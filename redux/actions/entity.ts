import {
  ReduxState,
  CreateEntity,
  UpdateEntity,
  DeleteEntity,
  RemoveEntity,
} from "../types";

export function createEntity(state: ReduxState, action: CreateEntity) {
  const { entityName, id, data } = action;
  const entities = state[entityName];
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
export function deleteEntity(state: ReduxState, action: DeleteEntity) {
  const { entityName, id } = action;
  const entities = state[entityName];
  const entity = state[entityName][id];
  return {
    ...state,
    [entityName]: {
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
