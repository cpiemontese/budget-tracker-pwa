import unset from "lodash.unset";
import cloneDeep from "lodash.clonedeep";
import nextConnect, { NextHandler } from "next-connect";
import { NextApiResponse } from "next";
import { randomString } from "../lib/common";
import { NextApiRequestWithLogger } from "../types";

async function tracer(
  req: NextApiRequestWithLogger,
  res: NextApiResponse,
  next: NextHandler
) {
  const requestId = randomString();
  const start = Date.now();

  const loggableBody = cloneDeep(req.body);
  unset(loggableBody, "password");

  req.logger.info(
    {
      id: requestId,
      headers: req.headers,
      query: req.query,
      body: loggableBody,
    },
    `Incoming request${req.url ? ` - ${req.url}` : ""}`
  );

  res.on("finish", () => {
    const end = Date.now();
    const loggableHeaders = res.getHeaders();
    unset(loggableHeaders, "cookie");
    unset(loggableHeaders, "cookies");
    unset(loggableHeaders, "set-cookie");
    req.logger.info(
      {
        id: requestId,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        headers: { sent: res.headersSent, value: loggableHeaders },
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
