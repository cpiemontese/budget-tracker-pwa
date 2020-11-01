import nextConnect, { NextHandler } from "next-connect";
import { NextApiRequestWithLogger } from "../types";
import { NextApiResponse } from "next";
import { randomString } from "../lib/common";

async function tracer(
  req: NextApiRequestWithLogger,
  res: NextApiResponse,
  next: NextHandler
) {
  const requestId = randomString();
  const start = Date.now();

  req.logger.info(
    {
      id: requestId,
      headers: req.headers,
      cookies: req.cookies,
      query: req.query,
      body: req.body,
    },
    `Incoming request${req.url ? ` - ${req.url}` : ""}`
  );

  res.on("finish", () => {
    const end = Date.now();
    req.logger.info(
      {
        id: requestId,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        headers: { sent: res.headersSent, value: res.getHeaders() },
        duration: `${(end - start).toFixed()}ms`,
      },
      `Outgoing response${req.url ? ` - ${req.url}` : ""}`
    );
  });

  return next();
}

const middleware = nextConnect();

middleware.use(tracer);

export default middleware;
