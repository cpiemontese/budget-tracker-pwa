import Head from "next/head";
import Link from "next/link";
import Layout, { siteTitle } from "../components/layout";
import { useEffect } from "react";
import { GetStaticProps } from "next";
import { useDispatch, useSelector } from "react-redux";

import logger from "../lib/logger";
import utilStyles from "../styles/utils.module.css";
import commonStyles from "../styles/common.module.css";
import { ReduxState } from "../redux/types";
import { amountToValue } from "../lib/crud/budget-items/common";
import { userError, userReceive, userRequest } from "../redux/actions";

const log = logger();

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
        <Link href="/funds">
          <button
            className={`w-full ${commonStyles.btn} ${commonStyles["btn-blue"]}`}
          >
            +
          </button>
        </Link>
        <ul className={utilStyles.list}>
          {Object.keys(funds).map((id) => (
            <Link href="/funds/[id]" as={`/funds/${id}`} key={id}>
              <a>
                <p>{funds[id].name}</p>
                <p>{funds[id].amount}</p>
                <p>{funds[id].createdAt}</p>
                <p>{funds[id].updatedAt}</p>
              </a>
            </Link>
          ))}
        </ul>
        <h2 className={utilStyles.headingLg}>Budget Items</h2>
        <button
          className={`w-full ${commonStyles.btn} ${commonStyles["btn-blue"]}`}
        >
          +
        </button>
        <ul className={utilStyles.list}>
          {Object.keys(budgetItems).map((id) => (
            <li className={utilStyles.listItem} key={id}>
              <p>{budgetItems[id].name}</p>
              <p>
                {amountToValue(budgetItems[id].amount, budgetItems[id].type)}
              </p>
              <p>{budgetItems[id].type}</p>
              <p>{budgetItems[id].category}</p>
              <p>{budgetItems[id].fund}</p>
              <p>{budgetItems[id].createdAt}</p>
              <p>{budgetItems[id].updatedAt}</p>
            </li>
          ))}
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
        },
        budgetItems: {
          "4567": {
            id: "4567",
            fund: "1234",
            amount: 50,
            type: "expense",
            name: "some item",
            category: "some category",
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
