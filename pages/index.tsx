import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";
import { GetStaticProps } from "next";
import { useDispatch, useSelector } from "react-redux";

import logger from "../lib/logger";
import utilStyles from "../styles/utils.module.css";
import commonStyles from "../styles/common.module.css";
import EntityListItem from "../components/entity-list-item";
import Layout, { siteTitle } from "../components/layout";
import { ReduxState } from "../redux/types";
import { amountToValue } from "../lib/crud/budget-items/common";
import { userError, userReceive, userRequest } from "../redux/actions";

const log = logger({ browser: true });

const addButton = (
  <button
    className={`w-full ${commonStyles.smooth} ${commonStyles.btn} ${commonStyles["btn-blue"]}`}
  >
    +
  </button>
);

export default function Home() {
  const { funds, budgetItems, fetching } = useSelector((state: ReduxState) => ({
    funds: state.funds,
    budgetItems: state.budgetItems,
    fetching: state.fetching,
  }));

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(userRequest);
    fetch("/api/verify", {
      headers: { cookie: document.cookie },
    })
      .then((response) => response.json())
      .then((jsonResponse) => dispatch(userReceive(jsonResponse)))
      .catch((error) => {
        log.error(
          { cookie: document.cookie, error: error.message },
          "verify fetch error"
        );
        dispatch(userError);
      });
  }, []);

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        {fetching && <p>Fetching...</p>}
        <h2 className={utilStyles.headingLg}>Funds</h2>
        <Link href="/funds">{addButton}</Link>
        <ul className={utilStyles.list}>
          {Object.keys(funds).map((id) =>
            funds[id].deleted ? null : (
              <EntityListItem
                key={id}
                id={id}
                endpoint="funds"
                entityName="funds"
                name={funds[id].name}
                amount={funds[id].amount.toFixed(2)}
              />
            )
          )}
        </ul>
        <h2 className={utilStyles.headingLg}>Budget Items</h2>
        <Link href="/budget-items">{addButton}</Link>
        <ul className={utilStyles.list}>
          {Object.keys(budgetItems).map((id) =>
            budgetItems[id].deleted ? null : (
              <EntityListItem
                key={id}
                id={id}
                endpoint="budget-items"
                entityName="budgetItems"
                name={budgetItems[id].name}
                amount={amountToValue(
                  budgetItems[id].amount,
                  budgetItems[id].type
                ).toFixed(2)}
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
