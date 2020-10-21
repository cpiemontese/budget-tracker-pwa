import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Layout from "../../components/layout";
import commonStyles from "../../styles/common.module.css";
import {
  createFund,
  syncFailure,
  syncRequest,
  syncSuccess,
} from "../../redux/actions";
import { ReduxState } from "../../redux/types";
import logger from "../../lib/logger";

const log = logger();

const pageName = "Create a new fund";

const formLabel = "text-black-500 font-bold md:text-right mb-1 md:mb-0 pr-4";
const formInput =
  "bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500";

export default function FundPage() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0.0);
  const router = useRouter();

  const { logged, email } = useSelector((state: ReduxState) => ({
    logged: state.logged,
    email: state.email,
  }));

  const dispatch = useDispatch();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(createFund(name, amount));
    router.push("/");

    if (logged) {
      dispatch(syncRequest);
      fetch(`/api/funds/${email}`, {
        method: "POST",
        body: JSON.stringify({ name, amount }),
      })
        .then((response) => dispatch(response.ok ? syncSuccess : syncFailure))
        .catch((error) => log.error({ error: error.message }));
    }
  }

  return (
    <Layout overrideName={pageName}>
      <Head>
        <title>{pageName}</title>
      </Head>
      <form onSubmit={handleSubmit} className="w-full">
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
            className={`w-full ${commonStyles.btn} ${commonStyles["btn-green"]}`}
            type="submit"
            value="Create"
          />
        </div>
      </form>
    </Layout>
  );
}
