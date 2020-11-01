import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { GetStaticProps } from "next";
import { useDispatch, useSelector } from "react-redux";

import logger from "../lib/logger";
import commonStyles from "../styles/common.module.css";
import EntityListItem from "../components/entity-list-item";
import Layout, { siteTitle } from "../components/layout";
import { ReduxState } from "../redux/types";
import { amountToValue } from "../lib/crud/budget-items/common";
import { userError, userReceive, userRequest } from "../redux/actions";
import FundDeleteModal from "../components/fund-delete-modal";
import BudgeItemDeleteModal from "../components/budget-item-delete-modal";
import MessageModal from "../components/message-modal";

const log = logger({ browser: true });

const addButton = (clickHandler: (event: any) => void = () => null) => (
  <button
    className={`w-full mb-4 ${commonStyles.smooth} ${commonStyles.btn} ${commonStyles["btn-blue"]}`}
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
    if (logged) {
      return;
    }
    dispatch(userRequest);
    fetch("/api/verify", {
      headers: { cookie: document.cookie },
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

  const fundsKeys = Object.keys(funds);
  const budgetItemsKeys = Object.keys(budgetItems);

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      {fundModal && (
        <FundDeleteModal id={fundToDelete} setVisible={setFundModal} />
      )}
      {budgetItemModal && (
        <BudgeItemDeleteModal
          id={budgetItemToDelete}
          setVisible={setBudgetItemModal}
        />
      )}
      <MessageModal
        visible={messageModal}
        title={messageTitle}
        body={messageBody}
        setVisible={setMessageModal}
      />
      <section className="">
        {fetching && <p>Fetching...</p>}
        <h2 className="text-2xl font-medium mb-2">Funds</h2>
        <Link href="/funds">{addButton()}</Link>
        <ul className="mb-4 max-h-48 overflow-y-scroll">
          {fundsKeys.map((id, index) =>
            funds[id].deleted ? null : (
              <EntityListItem
                key={id}
                id={id}
                last={index === fundsKeys.length - 1}
                endpoint="funds"
                entityName="funds"
                name={funds[id].name}
                amount={funds[id].amount.toFixed(2)}
                deleteHandler={deleteHandler}
              />
            )
          )}
        </ul>
        <h2 className="text-2xl font-medium mb-2">Budget items</h2>
        <Link href="/budget-items">
          {addButton((event) => {
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
        <ul className="max-h-screen overflow-y-scroll">
          {budgetItemsKeys.map((id, index) =>
            budgetItems[id].deleted ? null : (
              <EntityListItem
                key={id}
                id={id}
                last={index === budgetItemsKeys.length - 1}
                endpoint="budget-items"
                entityName="budgetItems"
                name={budgetItems[id].name}
                amount={amountToValue(
                  budgetItems[id].amount,
                  budgetItems[id].type
                ).toFixed(2)}
                deleteHandler={deleteHandler}
              />
            )
          )}
        </ul>
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
