import { ReduxState, Sync } from "../types";

export function sync(state: ReduxState, action: Sync) {
  const { localId, backendId, entityName } = action;
  const entity = state[entityName][localId];
  return {
    ...state,
    syncing: false,
    lastSyncFailed: false,
    [entityName]: {
      ...Object.keys(state[entityName]).reduce((newEntities, key) => {
        if (key !== localId) {
          newEntities[key] = state[entityName][key];
        }
        return newEntities;
      }, {}),
      [backendId]: {
        ...entity,
        id: backendId,
        synced: true,
      },
    },
  };
}
