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

export default function UpdateBudgetItem() {
  const router = useRouter();
  const id = router.query.id as string;

  const { funds, budgetItem } = useSelector((state: ReduxState) => ({
    funds: state.funds,
    budgetItem: state.budgetItems[id],
  }));

  const [name, setName] = useState(get(budgetItem, "name", ""));
  const [amount, setAmount] = useState(get(budgetItem, "amount", 0.0));
  const [fundId] = useState(get(budgetItem, "fund", ""));
  const [type] = useState(get(budgetItem, "type", "expense"));
  const [category, setCategory] = useState(get(budgetItem, "category", ""));
  const [description, setDescription] = useState(
    get(budgetItem, "description", "")
  );

  return (
    <EntityUpdateForm
      endpoint="budget-items"
      entityName="budgetItems"
      getData={() => ({
        name,
        amount,
        fund: fundId,
        type,
        category,
        description,
      })}
    >
      {(submitHandler: (event: FormEvent<HTMLFormElement>) => void) => (
        <Layout overrideName="Update budget item">
          <Head>
            <title>Update fund</title>
          </Head>
          <form onSubmit={submitHandler} className="w-full">
            <div className="md:flex md:items-center mb-6">
              <label
                className={`md:w-1/3 block md:text-right md:mb-0 ${commonStyles["form-label"]}`}
                htmlFor="name-input"
              >
                Name
              </label>
              <input
                id="name-input"
                className={`md:w-2/3 ${commonStyles["form-input"]} ${commonStyles["form-input-blue"]}`}
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="md:flex md:items-center mb-6">
              <label
                className={`md:w-1/3 block md:text-right md:mb-0 ${commonStyles["form-label"]}`}
                htmlFor="amount-input"
              >
                Amount
              </label>
              <input
                id="amount-input"
                className={`md:w-2/3 ${commonStyles["form-input"]} ${commonStyles["form-input-blue"]}`}
                type="number"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(parseFloat(event.target.value))}
              />
            </div>
            <div className="md:flex md:items-center mb-6">
              <label
                className={`md:w-1/3 block md:text-right md:mb-0 ${commonStyles["form-label"]}`}
                htmlFor="category-input"
              >
                Category
              </label>
              <input
                id="category-input"
                className={`md:w-2/3 ${commonStyles["form-input"]} ${commonStyles["form-input-blue"]}`}
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              />
            </div>
            <div className="md:flex md:items-center mb-6">
              <label
                className={`md:w-1/3 block md:text-right md:mb-0 ${commonStyles["form-label"]}`}
                htmlFor="description-input"
              >
                Description
              </label>
              <input
                id="description-input"
                className={`md:w-2/3 ${commonStyles["form-input"]} ${commonStyles["form-input-blue"]}`}
                type="text"
                value={category}
                onChange={(event) => setDescription(event.target.value)}
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
