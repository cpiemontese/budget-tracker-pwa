import cookieCutter from "cookie-cutter"
import env from './env';

const localEnv = env();

export default async function verify() {
  return true;
}