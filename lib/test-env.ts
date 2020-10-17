import { LocalEnv } from "../types";

export default function getEnv(): LocalEnv {
  return {
    app: {
      name: "Budget Tracker",
      host: "www.budget-tracker.com",
    },
    db: {
      uri: "mongodb://localhost:27017",
      name: "test",
      maxIdlePeriod: 1000,
      collections: {
        users: "users"
      }
    },
    logLevel: "debug",
    smtp: {
      host: "smtp-relay.sendinblue.com",
      user: "cristiano.piemontese@gmail.com",
      password: "pwd",
    },
    mailerName: "Cristiano Piemontese",
    loginCookie: {
      name: "Login-Cookie",
      maxAge: 2592000,
    },
    resetTokenMaxAge: 2592000,
  };
}
