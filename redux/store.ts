import { useMemo } from 'react'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { ActionTypes, ReduxState, UPDATE_FUND } from '../types'

let store

const initialState: ReduxState = {
  logged: false,
  funds: {},
  budgetItems: {},
}

const reducer = (state = initialState, action: ActionTypes) => {
  switch (action.type) {
    case UPDATE_FUND: {
      const { id, updates } = action
      const funds = state.funds
      const fund = state.funds[id]
      return Object.assign({}, state, {
        funds: {
          ...funds,
          [id]: {
            ...fund,
            ...updates
          }
        }
      })
    }
    default:
      return state
  }
}

function initStore(preloadedState = initialState) {
  return createStore(
    reducer,
    preloadedState,
    composeWithDevTools(applyMiddleware())
  )
}

export const initializeStore = (preloadedState: ReduxState) => {
  let _store = store ?? initStore(preloadedState)

  // After navigating to a page with an initial Redux state, merge that state
  // with the current state in the store, and create a new store
  if (preloadedState && store) {
    _store = initStore({
      ...preloadedState,
      ...store.getState(),
    })
    // Reset the current store
    store = undefined
  }

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return _store
  // Create the store once in the client
  if (!store) store = _store

  return _store
}

export function useStore(initialState: ReduxState) {
  const store = useMemo(() => initializeStore(initialState), [initialState])
  return store
}