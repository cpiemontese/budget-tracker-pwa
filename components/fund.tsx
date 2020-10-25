import Head from "next/head";
import { FormEvent, SetStateAction } from "react";

import Layout from "./layout";
import commonStyles from "../styles/common.module.css";

const formLabel = "text-black-500 font-bold md:text-right mb-1 md:mb-0 pr-4";
const formInput =
  "bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500";

export default function Fund({
  pageName,
  type,
  name,
  amount,
  setName,
  setAmount,
  submitHandler,
}: {
  pageName: string;
  type: "create" | "update";
  name: string;
  amount: number;
  setName: (value: SetStateAction<string>) => void;
  setAmount: (value: SetStateAction<number>) => void;
  submitHandler: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Layout overrideName={pageName}>
      <Head>
        <title>{pageName}</title>
      </Head>
      <form onSubmit={submitHandler} className="w-full">
        <div className="md:flex md:items-center mb-6">
          <label className={`md:w-1/3 block ${formLabel}`} htmlFor="name-input">
            Name
          </label>
          <input
            id="name-input"
            className={`md:w-2/3 ${formInput}`}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="md:flex md:items-center mb-6">
          <label
            className={`md:w-1/3 block ${formLabel}`}
            htmlFor="amount-input"
          >
            Amount
          </label>
          <input
            type="number"
            className={`md:w-2/3 ${formInput}`}
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(parseFloat(event.target.value))}
          />
        </div>
        <div>
          <input
            className={`w-full ${commonStyles.btn} ${
              type === "create"
                ? commonStyles["btn-green"]
                : commonStyles["btn-blue"]
            }`}
            type="submit"
            value={type === "create" ? "Create" : "Update"}
          />
        </div>
      </form>
    </Layout>
  );
}
