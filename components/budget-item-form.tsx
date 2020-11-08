import Head from "next/head";
import { useSelector } from "react-redux";
import React, { FormEvent, useState } from "react";

import Layout from "./layout";
import commonStyles from "../styles/common.module.css";
import { ReduxState } from "../redux/types";
import { budgetItemDateFormat, budgetItemDateParse } from "../lib/common";

export default function BudgetItemForm({
  type,
  startingName,
  startingAmount,
  startingFundId,
  startingType,
  startingDate,
  startingCategory,
  startingDescription,
  submitHandler,
}: {
  type: "create" | "update";
  startingName: string;
  startingAmount: number;
  startingFundId?: string;
  startingType: "expense" | "income";
  startingDate: number;
  startingCategory: string;
  startingDescription: string;
  submitHandler: (
    event: FormEvent<HTMLFormElement>,
    getData: () => object
  ) => void;
}) {
  const funds = useSelector((state: ReduxState) => state.funds);

  const [firstFund] = Object.keys(funds);

  const [name, setName] = useState(startingName);
  const [amount, setAmount] = useState(startingAmount);
  const [fundId, setFundId] = useState(startingFundId ?? firstFund);
  const [budgetItemType, setType] = useState(startingType);
  const [date, setDate] = useState(startingDate);
  const [category, setCategory] = useState(startingCategory);
  const [description, setDescription] = useState(startingDescription);

  const elementsColor = type === "create" ? "green" : "blue";

  const formLabel = `md:w-1/3 block md:text-right md:mb-0 ${commonStyles["form-label"]}`;
  const formInput = `md:w-2/3 ${commonStyles.smooth} ${
    commonStyles["form-input"]
  } ${commonStyles[`form-input-${elementsColor}`]}`;

  const pageLabel = type === "create" ? "Create" : "Update";
  const pageName = `${pageLabel} budget item`;
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
            fund: fundId,
            type: budgetItemType,
            date,
            category,
            description,
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
        <div className="md:flex md:items-center mb-6">
          <label className={formLabel} htmlFor="type-input">
            Type
          </label>
          <select
            id="type-input"
            value={budgetItemType}
            className={formInput}
            onChange={(event) =>
              setType(event.target.value as "expense" | "income")
            }
            required={true}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="md:flex md:items-center mb-6">
          <label className={formLabel} htmlFor="fund-input">
            Fund
          </label>
          <select
            id="fund-input"
            value={fundId}
            className={formInput}
            onChange={(event) => setFundId(event.target.value)}
            required={true}
          >
            {Object.keys(funds).map((key) => {
              return (
                <option key={key} value={key}>
                  {funds[key].name}
                </option>
              );
            })}
          </select>
        </div>
        <div className="md:flex md:items-center mb-6">
          <label className={formLabel} htmlFor="date-input">
            Date
          </label>
          <input
            id="date-input"
            className={formInput}
            type="date"
            value={budgetItemDateFormat(date)}
            onChange={(event) =>
              setDate(budgetItemDateParse(event.target.value))
            }
            required={true}
          />
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
          ></textarea>
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
