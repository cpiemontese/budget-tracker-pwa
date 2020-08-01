import nextConnect, { NextHandler } from "next-connect";
import { NextApiRequestWithLogger } from "../types";
import { NextApiResponse } from "next";
import pino from "pino";

const pinoLogger = pino({ level: process.env.LOG_LEVEL });

async function logger(
  req: NextApiRequestWithLogger,
  _res: NextApiResponse,
  next: NextHandler
) {
  req.logger = pinoLogger;
  return next();
}

const middleware = nextConnect();

middleware.use(logger);

export default middleware;
