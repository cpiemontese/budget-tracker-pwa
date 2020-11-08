import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { GetStaticProps } from "next";
import { useDispatch, useSelector } from "react-redux";

import logger from "../lib/logger";
import commonStyles from "../styles/common.module.css";
import FundListItem from "../components/fund-list-item";
import Layout, { siteTitle } from "../components/layout";
import { ReduxState } from "../redux/types";
import { amountToValue } from "../lib/crud/budget-items/common";
import { userError, userReceive, userRequest } from "../redux/actions";
import FundDeleteModal from "../components/fund-delete-modal";
import BudgetItemDeleteModal from "../components/budget-item-delete-modal";
import MessageModal from "../components/message-modal";
import Spinner from "../components/spinner";
import { BudgetItem } from "../types";
import { budgetItemDateFormat, budgetItemDateParse } from "../lib/common";
import BudgetListItem from "../components/budget-list-item";
import { DateTime } from "luxon";

const log = logger({ browser: true });

let fetched = false;

const AddButton = (clickHandler: (event: any) => void = () => null) => (
  <button
    aria-label="Add"
    className={`w-10 h-10 sm:w-1/6 flex items-center justify-center leading-none text-white font-bold rounded-full sm:rounded ${commonStyles.smooth} ${commonStyles["btn-blue"]}`}
    onClick={clickHandler}
  >
    +
  </button>
);

export default function Home() {
  const { funds, budgetItems, logged, fetching } = useSelector(
    (state: ReduxState) => ({
      funds: state.funds,
      budgetItems: state.budgetItems,
      logged: state.logged,
      fetching: state.fetching,
    })
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (logged || fetched) {
      return;
    }
    fetched = true;
    dispatch(userRequest);
    fetch("/api/verify", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        cookie: document.cookie,
      },
    })
      .then((response) => response.json())
      .then((jsonResponse) => dispatch(userReceive(jsonResponse)))
      .catch((error) => {
        dispatch(userError);
        log.error(
          { cookie: document.cookie, error: error.message },
          "verify fetch error"
        );
      });
  }, []);

  const [messageModal, setMessageModal] = useState(false);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");

  const [fundModal, setFundModal] = useState(false);
  const [fundToDelete, setFundToDelete] = useState("");

  const [budgetItemModal, setBudgetItemModal] = useState(false);
  const [budgetItemToDelete, setBudgetItemToDelete] = useState("");

  const [typeFilter, setTypeFilter] = useState("none");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [fundFilter, setFundFilter] = useState("none");

  const today = DateTime.utc().toISODate();
  const [monthSelection, setMonthSelection] = useState(today.split("-")[1]);
  const [yearSelection, setYearSelection] = useState(today.split("-")[0]);

  const deleteHandler = (id: string, entityName: "funds" | "budgetItems") => {
    switch (entityName) {
      case "funds":
        setFundModal(true);
        setFundToDelete(id);
        setBudgetItemModal(false);
        return;
      case "budgetItems":
        setFundModal(false);
        setBudgetItemModal(true);
        setBudgetItemToDelete(id);
        return;
      default:
        log.warn({ id, entityName }, "Delete handler - unknown entity");
        return;
    }
  };

  const matchesFilter = (budgetItem: BudgetItem) => {
    const splitDate = budgetItemDateFormat(budgetItem.date).split("-");

    return (
      (typeFilter === "none" || budgetItem.type === typeFilter) &&
      (categoryFilter.length === 0 ||
        new RegExp(categoryFilter).test(budgetItem.category)) &&
      (fundFilter === "none" || budgetItem.fund === fundFilter) &&
      yearSelection === splitDate[0] &&
      monthSelection === splitDate[1]
    );
  };

  const fundsKeys = Object.keys(funds);
  const budgetItemsKeys = Object.keys(budgetItems);

  const total = Object.keys(funds).reduce((total, key) => {
    return total + funds[key].amount;
  }, 0);

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <FundDeleteModal
        id={fundToDelete}
        visible={fundModal}
        setVisible={setFundModal}
      />
      <BudgetItemDeleteModal
        id={budgetItemToDelete}
        visible={budgetItemModal}
        setVisible={setBudgetItemModal}
      />
      <MessageModal
        visible={messageModal}
        title={messageTitle}
        body={messageBody}
        setVisible={setMessageModal}
      />
      <section>
        <div
          className={`w-full sm:w-1/2 mx-auto flex mb-6 border-b-2 border-${
            total >= 0 ? "green" : "red"
          }-500`}
        >
          <h2 className="w-1/2 text-2xl text-center text-gray-700">Total</h2>
          <div className="w-1/2 text-2xl text-center">{total}</div>
        </div>
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-medium">Funds</h2>
          <Link href="/funds">{AddButton()}</Link>
        </div>
        {fetching ? (
          <div className="w-full h-12 flex justify-center items-center">
            <Spinner />
          </div>
        ) : (
          <ul className="mb-8 max-h-48 overflow-y-scroll">
            {fundsKeys.map((id, index) =>
              funds[id].deleted ? null : (
                <FundListItem
                  key={id}
                  id={id}
                  last={index === fundsKeys.length - 1}
                  name={funds[id].name}
                  amount={funds[id].amount.toFixed(2)}
                  deleteHandler={deleteHandler}
                />
              )
            )}
          </ul>
        )}
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-medium">Budget Items</h2>
          <Link href="/budget-items">
            {AddButton((event) => {
              if (fundsKeys.filter((key) => !funds[key].deleted).length === 0) {
                event.preventDefault();
                setMessageModal(true);
                setMessageTitle("No fund present");
                setMessageBody(
                  "You can't add a new item without any funds! Please add a fund first."
                );
              }
            })}
          </Link>
        </div>
        <div className="w-full md:flex items-center mb-6">
          <div className="w-full md:w-1/5 mb-2 md:mb-0 font-medium text-gray-700">
            Filters
          </div>
          <div className="w-full md:w-4/5 md:flex items-center text-sm">
            <div className="w-full md:mr-2">
              <div className="flex mb-2">
                <label
                  htmlFor="type-filter"
                  className="w-1/4 font-bold text-gray-700"
                >
                  Type
                </label>
                <select
                  id="type-filter"
                  value={typeFilter}
                  className={`w-3/4 pl-1 ${commonStyles["form-input-skinny"]} ${commonStyles["form-input-blue"]} ${commonStyles.smooth}`}
                  onChange={(event) =>
                    setTypeFilter(
                      event.target.value as "expense" | "income" | null
                    )
                  }
                >
                  <option value="none">None</option>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="flex mb-2 md:mb-0">
                <label
                  htmlFor="category-filter"
                  className="w-1/4 font-bold text-gray-700"
                >
                  Category
                </label>
                <div className="w-3/4">
                  <input
                    id="category-filter"
                    type="text"
                    value={categoryFilter}
                    placeholder="some category"
                    className={`pl-2 w-full ${commonStyles["form-input-skinny"]} ${commonStyles["form-input-blue"]} ${commonStyles.smooth}`}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="w-full md:ml-2">
              <div className="flex">
                <label
                  className="w-1/4 font-bold text-gray-700"
                  htmlFor="fund-input"
                >
                  Fund
                </label>
                <select
                  id="fund-input"
                  value={fundFilter}
                  className={`pl-1 w-3/4 ${commonStyles["form-input-skinny"]} ${commonStyles["form-input-blue"]} ${commonStyles.smooth}`}
                  onChange={(event) => setFundFilter(event.target.value)}
                >
                  <option value="none">None</option>
                  {Object.keys(funds).map((key) => {
                    return (
                      <option key={key} value={key}>
                        {funds[key].name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full sm:w-1/2 flex mx-auto mb-8">
          <input
            aria-label="Year Selector"
            id="year-selector"
            type="text"
            min="4"
            max="4"
            value={yearSelection}
            className={`w-1/2 pl-1 mr-1 text-center border-b-2 hover:border-gray-500 focus:border-blue-500 ${commonStyles.smooth}`}
            onChange={(event) => setYearSelection(event.target.value)}
          />
          <select
            aria-label="Month Selector"
            id="month-selector"
            name="month-selector"
            value={monthSelection}
            className={`w-1/2 pl-1 ml-1 text-center appearance-none bg-white border-b-2 hover:border-gray-500 focus:border-blue-500 ${commonStyles.smooth}`}
            onChange={(event) => setMonthSelection(event.target.value)}
          >
            <option value="01">January</option>
            <option value="02">Febuary</option>
            <option value="03">March</option>
            <option value="04">April</option>
            <option value="05">May</option>
            <option value="06">June</option>
            <option value="07">July</option>
            <option value="08">August</option>
            <option value="09">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>
        </div>
        {fetching ? (
          <div className="w-full h-12 flex justify-center items-center">
            <Spinner />
          </div>
        ) : (
          <ul className="max-h-screen overflow-y-scroll">
            {budgetItemsKeys.map((id, index) =>
              budgetItems[id].deleted ||
              !matchesFilter(budgetItems[id]) ? null : (
                <BudgetListItem
                  key={id}
                  id={id}
                  last={index === budgetItemsKeys.length - 1}
                  name={budgetItems[id].name}
                  amount={amountToValue(
                    budgetItems[id].amount,
                    budgetItems[id].type
                  ).toFixed(2)}
                  date={budgetItems[id].date}
                  category={budgetItems[id].category}
                  deleteHandler={deleteHandler}
                />
              )
            )}
          </ul>
        )}
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      initialReduxState: {
        fetching: false,
        logged: false,
        syncing: false,
        lastSyncFailed: false,
        email: null,
        funds: {
          "1234": {
            id: "1234",
            amount: 123.3,
            name: "some fund",
            synced: false,
            deleted: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          "4321": {
            id: "4321",
            amount: 321,
            name: "some other fund",
            synced: false,
            deleted: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
        budgetItems: {
          "4567": {
            id: "4567",
            fund: "1234",
            amount: 50,
            type: "expense",
            date: budgetItemDateParse(budgetItemDateFormat(Date.now())),
            name: "some item",
            category: "some category",
            description: "some description",
            synced: false,
            deleted: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
      },
    },
  };
};
