import Head from "next/head";
import { FormEvent, useState } from "react";

import Layout from "../../components/layout";

const pageName = "Create a new fund";

const classes = {
  label: "text-black-500 font-bold md:text-right mb-1 md:mb-0 pr-4",
  input:
    "bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500",
};

export default function FundPage() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0.0);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO
    // - dispatch update
    // - dispatch sync start if user is logged in
    // - dispatch sync end when sync ends (if sync was started)
  }

  return (
    <Layout overrideName={pageName}>
      <Head>
        <title>{pageName}</title>
      </Head>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="md:flex md:items-center mb-6">
          <label
            className={`md:w-1/3 block ${classes.label}`}
            htmlFor="name-input"
          >
            Name
          </label>
          <input
            id="name-input"
            className={`md:w-2/3 ${classes.input}`}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="md:flex md:items-center mb-6">
          <label
            className={`md:w-1/3 block ${classes.label}`}
            htmlFor="amount-input"
          >
            Amount
          </label>
          <input
            type="number"
            className={`md:w-2/3 ${classes.input}`}
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(parseFloat(event.target.value))}
          />
        </div>
        <div>
          <input
            className="w-full p-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold rounded"
            type="submit"
            value="Create"
          />
        </div>
      </form>
    </Layout>
  );
}
