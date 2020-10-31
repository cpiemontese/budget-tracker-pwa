import Head from "next/head";
import React, { FormEvent, useState } from "react";

import Layout from "../../components/layout";
import commonStyles from "../../styles/common.module.css";
import EntityCreateForm from "../../components/entity-create-form";

const formLabel = `md:w-1/3 block md:text-right md:mb-0 ${commonStyles["form-label"]}`;
const formInput = `md:w-2/3 ${commonStyles.smooth} ${commonStyles["form-input"]} ${commonStyles["form-input-green"]}`;

export default function CreateFund() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0.0);

  return (
    <EntityCreateForm
      endpoint="funds"
      entityName="funds"
      getData={() => ({
        name,
        amount,
      })}
    >
      {(submitHandler: (event: FormEvent<HTMLFormElement>) => void) => (
        <Layout overrideName="Create fund">
          <Head>
            <title>Update fund</title>
          </Head>
          <form onSubmit={submitHandler} className="w-full">
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
              />
            </div>
            <div>
              <input
                className={`w-full ${commonStyles.smooth} ${commonStyles.btn} ${commonStyles["btn-green"]}`}
                type="submit"
                value="Create"
              />
            </div>
          </form>
        </Layout>
      )}
    </EntityCreateForm>
  );
}
