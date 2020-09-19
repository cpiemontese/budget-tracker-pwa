import { Logger } from "pino";
import { Collection } from "mongodb";

import { User } from "../types";

export { verifyHandler };

async function verifyHandler(
  email: string,
  loginTokenToVerify: string,
  usersCollection: Collection,
  logger: Logger
) {
  if ([email, loginTokenToVerify].some((value) => value === null)) {
    return 400;
  }

  let user: User = null;
  try {
    user = await usersCollection.findOne({ email });
  } catch (error) {
    logger.error(
      {
        error: error.message,
      },
      "/api/verify - user fetch error"
    );
    return 500;
  }

  if (user === null || user === undefined) {
    return 500;
  }

  const { loginToken, loginTokenExpiration } = user;

  const tokenIsExpired = Date.now() > loginTokenExpiration;
  const tokenMatches = loginToken === loginTokenToVerify;

  return !tokenMatches || tokenIsExpired ? 401 : 204;
}
