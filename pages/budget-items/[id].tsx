import get from "lodash.get";
import Head from "next/head";

import React, { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import Layout from "../../components/layout";
import commonStyles from "../../styles/common.module.css";
import EntityUpdateForm from "../../components/entity-update-form";
import { ReduxState } from "../../redux/types";

const formLabel = `md:w-1/3 block md:text-right md:mb-0 ${commonStyles["form-label"]}`;
const formInput = `md:w-2/3 ${commonStyles.smooth} ${commonStyles["form-input"]} ${commonStyles["form-input-blue"]}`;

export default function UpdateBudgetItem() {
  const router = useRouter();
  const id = router.query.id as string;

  const { budgetItem, funds } = useSelector((state: ReduxState) => ({
    funds: state.funds,
    budgetItem: state.budgetItems[id],
  }));

  const [name, setName] = useState(get(budgetItem, "name", ""));
  const [amount, setAmount] = useState(get(budgetItem, "amount", 0.0));
  const [fundId, setFundId] = useState(get(budgetItem, "fund", ""));
  const [type, setType] = useState(get(budgetItem, "type", "expense"));
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
            <div className="md:flex md:items-center mb-6">
              <label className={formLabel} htmlFor="type-input">
                Type
              </label>
              <select
                id="type-input"
                className={formInput}
                onChange={(event) =>
                  setType(event.target.value as "expense" | "income")
                }
              >
                <option value="expense" selected={type === "expense"}>
                  Expense
                </option>
                <option value="income" selected={type === "income"}>
                  Income
                </option>
              </select>
            </div>
            <div className="md:flex md:items-center mb-6">
              <label className={formLabel} htmlFor="fund-input">
                Fund
              </label>
              <select
                id="fund-input"
                className={formInput}
                onChange={(event) => setFundId(event.target.value)}
              >
                {Object.keys(funds).map((key) => {
                  return (
                    <option value={key} selected={key === fundId}>
                      {funds[key].name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="md:flex md:items-center mb-6">
              <label className={formLabel} htmlFor="category-input">
                Category
              </label>
              <input
                id="category-input"
                className={formInput}
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              />
            </div>
            <div className="md:flex md:items-center mb-6">
              <label className={formLabel} htmlFor="description-input">
                Description
              </label>
              <textarea
                id="description-input"
                className={formInput}
                value={description}
                rows={3}
                maxLength={280}
                autoComplete="on"
                spellCheck={true}
                onChange={(event) => setDescription(event.target.value)}
              >
                {description}
              </textarea>
            </div>
            <div>
              <input
                className={`w-full ${commonStyles.smooth} ${commonStyles.btn} ${commonStyles["btn-blue"]}`}
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
