import get from "lodash.get";
import Head from "next/head";

import React, { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import Layout from "../../components/layout";
import commonStyles from "../../styles/common.module.css";
import EntityUpdateForm from "../../components/entity-update-form";
import { ReduxState } from "../../redux/types";

const formLabel = "text-black-500 font-bold md:text-right mb-1 md:mb-0 pr-4";
const formInput =
  "bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-green-500";

export default function UpdateFund() {
  const router = useRouter();
  const id = router.query.id as string;

  const fund = useSelector((state: ReduxState) => state.funds[id]);

  const [name, setName] = useState(get(fund, "name", ""));
  const [amount, setAmount] = useState(get(fund, "amount", 0.0));

  return (
    <EntityUpdateForm
      endpoint="funds"
      entityName="funds"
      getData={() => ({
        name,
        amount,
      })}
    >
      {(submitHandler: (event: FormEvent<HTMLFormElement>) => void) => (
        <Layout overrideName="Update fund">
          <Head>
            <title>Update fund</title>
          </Head>
          <form onSubmit={submitHandler} className="w-full">
            <div className="md:flex md:items-center mb-6">
              <label
                className={`md:w-1/3 block ${formLabel}`}
                htmlFor="name-input"
              >
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
                id="amount-input"
                className={`md:w-2/3 ${formInput}`}
                type="number"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(parseFloat(event.target.value))}
              />
            </div>
            <div>
              <input
                className={`w-full ${commonStyles.btn} ${commonStyles["btn-blue"]}`}
                type="submit"
                value="Update"
              />
            </div>
          </form>
        </Layout>
      )}
    </EntityUpdateForm>
  );
}
