import { ReduxState, Sync } from "../types";

export function sync(state: ReduxState, action: Sync) {
  const { localId, backendId, entityName } = action;
  const entity = state.funds[localId];
  delete state[entityName][localId];
  return {
    ...state,
    syncing: false,
    lastSyncFailed: false,
    [entityName]: {
      ...state[entityName],
      [backendId]: {
        ...entity,
        id: backendId,
        synced: true,
      },
    },
  };
}
