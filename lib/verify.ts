import { NextPage } from 'next'
import cookieCutter from "cookie-cutter"
import env from './env';

const localEnv = env();

export default async function verify() {
  const cookie = cookieCutter.get(localEnv.loginCookie.name);

  if (cookie === null || cookie === undefined) {
    return false
  }

  console.log(cookie);
  return true;
}