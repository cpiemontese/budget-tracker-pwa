import { serialize } from "cookie";

export function createCookie(name: string, value: string, maxAge: number) {
  return serialize(name, value, {
    maxAge,
    expires: new Date(Date.now() + maxAge * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export function createDeletionCookie(name: string) {
  return serialize(name, JSON.stringify(null), {
    maxAge: -1,
    path: "/",
  });
}
