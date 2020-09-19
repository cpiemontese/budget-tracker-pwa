import get from "lodash.get";
import { parse, serialize } from "cookie";

import { Logger } from "pino";
import { NextApiResponse } from "next";

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

export function getLoginCookie(
  res: NextApiResponse,
  name: string,
  logger: Logger
): { email: string; loginToken: string } {
  const cookies = parse(res.getHeader("Cookie") as string);

  let loginCookie = null;
  try {
    loginCookie = JSON.parse(get(cookies, name, "null"));
  } catch (error) {
    logger.error({ error: error.message }, "Could not parse login cookie");
  }

  return {
    email: get(loginCookie, ["email"], null),
    loginToken: get(loginCookie, ["loginToken"], null),
  };
}
