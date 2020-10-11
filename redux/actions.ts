import { User } from "../types";
import { USER_ERROR, USER_RECEIVE, USER_REQUEST } from "./types";

export const userRequest = {
  type: USER_REQUEST,
};

export const userReceive = (user: User) => ({
  type: USER_RECEIVE,
  user,
});

export const userError = {
  type: USER_ERROR,
};

export function fetchUser() {
  return (dispatch) => {
    dispatch(userRequest);

    return fetch("/api/verify")
      .then((response) => response.json())
      .then((json) => dispatch(userReceive(json)))
      .catch(console.error);
  };
}
