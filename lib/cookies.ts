import { serialize } from "cookie";

export function getCookie(name, value, maxAge) {
  return serialize(name, value, {
    maxAge,
    expires: new Date(Date.now() + maxAge * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export function getRemoveCookie(name) {
  return serialize(name, "", {
    maxAge: -1,
    path: "/",
  });
}