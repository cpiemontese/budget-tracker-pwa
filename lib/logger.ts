import pino from "pino";
import env from "./env";

const localEnv = env();

const serverLogger = pino({
  level: localEnv.logLevel,
});

const browserLogger = pino({
  level: localEnv.logLevel,
  browser: { asObject: true },
});

export default function logger({ browser = false } = {}) {
  return browser ? browserLogger : serverLogger;
}
