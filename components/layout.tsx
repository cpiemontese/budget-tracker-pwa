import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import logger from "../lib/logger";
import MessageModal from "./message-modal";
import commonStyles from "../styles/common.module.css";
import { ReduxState } from "../redux/types";
import { userLogout } from "../redux/actions";
import Spinner from "./spinner";

const log = logger({ browser: true });
const name = "Budget Tracker";
export const siteTitle = "Budget Tracker";

function LoginButton({ className }) {
  return (
    <Link href="/login">
      <button className={className}>Login</button>
    </Link>
  );
}

function SignupButton({ className }) {
  return (
    <Link href="/signup">
      <button className={className}>Signup</button>
    </Link>
  );
}

function LogoutButton({ className, logoutHandler }) {
  return (
    <button className={className} onClick={logoutHandler}>
      Logout
    </button>
  );
}

export default function Layout({
  children,
  home,
  overrideName,
}: {
  children: React.ReactNode;
  home?: boolean;
  overrideName?: string;
}) {
  const [burger, setBurger] = useState(false);

  const dispatch = useDispatch();

  const { logged, fetching } = useSelector((state: ReduxState) => ({
    logged: state.logged,
    fetching: state.fetching,
  }));

  const [messageModal, setMessageModal] = useState(false);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");

  function setLogoutErrorMessage() {
    setMessageTitle("Logout error");
    setMessageBody("An error occurred during logout, please retry");
    setMessageModal(true);
  }

  function logoutHandler() {
    fetch("/api/logout")
      .then((response) => {
        if (response.ok) {
          dispatch(userLogout);
          return;
        }
        setLogoutErrorMessage();
      })
      .catch((error) => {
        setLogoutErrorMessage();
        log.error({ error: error.message }, "Logout error");
      });
  }

  return (
    <div className="max-w-3xl min-h-screen mx-auto p-4 overflow-hidden">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="Budget Tracker"
          charSet="utf-8"
          content="Track your expenses and income with Budget Tracker"
        />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
        />
        <meta name="keywords" content="budget tracker,finance,tracker,budget" />
        <meta
          name="description"
          content="A simple budget tracker for your finances!"
        ></meta>
        <meta
          property="og:image"
          content={`https://og-image.now.sh/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />

        <link rel="manifest" href="/manifest.json" />
        <link href="/favicon.ico" rel="icon" type="image/ico" sizes="16x16" />
        <link href="/favicon.ico" rel="icon" type="image/ico" sizes="32x32" />
        <meta name="theme-color" content="#4299e1" />
      </Head>
      <header className="flex relative items-center mb-4 border-b-2">
        {home ? (
          <>
            <h1 className="w-full sm:w-3/4 text-4xl font-light">{name}</h1>
            {
              <div
                className={`sm:invisible w-10 h-8 flex flex-col justify-center`}
                onClick={() => setBurger(!burger)}
              >
                <span
                  className={`block h-1 bg-black rounded ${
                    burger ? "transform rotate-45 translate-y-1" : "mb-2"
                  } ${commonStyles.smooth}`}
                ></span>
                <span
                  className={`block h-1 bg-black rounded ${
                    burger ? "opacity-0" : "opacity-full mb-2"
                  } ${commonStyles.smooth}`}
                ></span>
                <span
                  className={`block h-1 bg-black rounded ${
                    burger ? "transform -rotate-45 -translate-y-1" : ""
                  } ${commonStyles.smooth}`}
                ></span>
              </div>
            }
            {fetching ? (
              <div className="flex justify-center align-center self-center invisible sm:visible sm:absolute sm:right-0 w-0 sm:w-1/4">
                <Spinner />
              </div>
            ) : (
              <div
                className={`flex ${
                  logged ? "justify-end" : "justify-between"
                } self-center invisible sm:visible sm:absolute sm:right-0 w-0 sm:w-1/4`}
              >
                {logged ? (
                  <LogoutButton
                    logoutHandler={logoutHandler}
                    className={`w-1/2 ${commonStyles.btn} ${commonStyles["btn-blue"]}`}
                  />
                ) : (
                  <>
                    <SignupButton
                      className={`w-full mr-1 ${commonStyles.btn} ${commonStyles["btn-blue"]}`}
                    />
                    <LoginButton
                      className={`w-full ml-1 ${commonStyles.btn} ${commonStyles["btn-blue"]}`}
                    />
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <h2 className="text-3xl font-light">{overrideName ?? name}</h2>
        )}
      </header>
      <main className="relative">
        <MessageModal
          visible={messageModal}
          title={messageTitle}
          body={messageBody}
          setVisible={setMessageModal}
        />
        <div
          className={`absolute inset-x-0 h-screen ${
            burger ? "opacity-full" : "w-0 opacity-0"
          } overflow-hidden bg-white ${commonStyles.smooth}`}
        >
          {logged ? (
            <LogoutButton
              logoutHandler={logoutHandler}
              className={`w-full block mb-4 ${commonStyles.btn} ${commonStyles["btn-blue"]}`}
            />
          ) : (
            <>
              <SignupButton
                className={`w-full block mb-4 ${commonStyles.btn} ${commonStyles["btn-blue"]}`}
              />
              <LoginButton
                className={`w-full block mb-4 ${commonStyles.btn} ${commonStyles["btn-blue"]}`}
              />
            </>
          )}
        </div>
        {children}
      </main>
      {!home && (
        <div className="mt-6">
          <Link href="/">
            <button
              className={`w-1/4 ${commonStyles.btn} ${commonStyles["btn-blue"]}`}
            >
              ← Back
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
