import { User } from "../types";

export const getNullUser = (): User => ({
  email: null,
  username: null,
  password: null,
  authenticated: false,
  authenticationToken: null,
  loginToken: null,
  resetToken: null,
  funds: [],
  budgetItems: []
})