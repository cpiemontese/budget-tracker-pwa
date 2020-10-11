import pino from "pino";
import env from "./env";

const localEnv = env();

const pinoLogger = pino({ level: localEnv.logLevel });

export default function logger() {
  return pinoLogger
}