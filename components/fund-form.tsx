import Head from "next/head";
import React, { FormEvent, useState } from "react";

import Layout from "./layout";
import commonStyles from "../styles/common.module.css";

export default function FundForm({
  type,
  startingName,
  startingAmount,
  submitHandler,
}: {
  type: "create" | "update";
  startingName: string;
  startingAmount: number;
  submitHandler: (
    event: FormEvent<HTMLFormElement>,
    getData: () => object
  ) => void;
}) {
  const [name, setName] = useState(startingName);
  const [amount, setAmount] = useState(startingAmount);

  const elementsColor = type === "create" ? "green" : "blue";

  const formLabel = `md:w-1/3 block md:text-right md:mb-0 ${commonStyles["form-label"]}`;
  const formInput = `md:w-2/3 ${commonStyles.smooth} ${
    commonStyles["form-input"]
  } ${commonStyles[`form-input-${elementsColor}`]}`;

  const pageLabel = type === "create" ? "Create" : "Update";
  const pageName = `${pageLabel} fund`;
  return (
    <Layout overrideName={pageName}>
      <Head>
        <title>{pageName}</title>
      </Head>
      <form
        onSubmit={(event) =>
          submitHandler(event, () => ({
            name,
            amount,
          }))
        }
        className="w-full"
      >
        <div className="md:flex md:items-center mb-6">
          <label className={formLabel} htmlFor="name-input">
            Name
          </label>
          <input
            id="name-input"
            className={formInput}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required={true}
          />
        </div>
        <div className="md:flex md:items-center mb-6">
          <label className={formLabel} htmlFor="amount-input">
            Amount
          </label>
          <input
            id="amount-input"
            className={formInput}
            type="number"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(parseFloat(event.target.value))}
            required={true}
          />
        </div>
        <div>
          <input
            className={`w-full ${commonStyles.smooth} ${commonStyles.btn} ${
              commonStyles[`btn-${elementsColor}`]
            }`}
            type="submit"
            value={pageLabel}
          />
        </div>
      </form>
    </Layout>
  );
}
