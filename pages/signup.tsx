import Head from "next/head";
import React, { useState } from "react";
import { useRouter } from "next/router";

import logger from "../lib/logger";
import Layout from "../components/layout";
import MessageModal from "../components/message-modal";
import commonStyles from "../styles/common.module.css";

const log = logger({ browser: true });

const pageName = "Login";
export default function Signup() {
  const formLabel = `md:w-1/3 block md:text-right md:mb-0 ${commonStyles["form-label"]}`;
  const formInput = `md:w-2/3 ${commonStyles.smooth} ${
    commonStyles["form-input"]
  } ${commonStyles[`form-input-green`]}`;

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [messageModal, setMessageModal] = useState(false);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");

  function setErrorMessage() {
    setMessageModal(true);
    setMessageTitle("Login Failed");
    setMessageBody("Something went wrong while logging you in, please retry");
  }

  function submitHandler(event) {
    event.preventDefault();

    fetch("/api/signup", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        username,
        password,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          setErrorMessage();
          return;
        }
        router.push("/");
      })
      .catch((error) => {
        log.error({ error: error.message }, "Login error");
        setErrorMessage();
      });
  }

  return (
    <Layout overrideName={pageName}>
      <Head>
        <title>{pageName}</title>
      </Head>
      <MessageModal
        visible={messageModal}
        title={messageTitle}
        body={messageBody}
        setVisible={setMessageModal}
      />
      <form onSubmit={submitHandler} className="w-full">
        <div className="md:flex md:items-center mb-6">
          <label className={formLabel} htmlFor="email-input">
            Email
          </label>
          <input
            id="email-input"
            className={formInput}
            type="email"
            value={email}
            minLength={4}
            required={true}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="md:flex md:items-center mb-6">
          <label className={formLabel} htmlFor="username-input">
            Username
          </label>
          <input
            id="username-input"
            className={formInput}
            type="text"
            value={username}
            minLength={4}
            required={true}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>
        <div className="md:flex md:items-center mb-6">
          <label className={formLabel} htmlFor="amount-input">
            Password
          </label>
          <input
            id="password-input"
            className={formInput}
            type="password"
            value={password}
            minLength={8}
            required={true}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div>
          <input
            className={`w-full ${commonStyles.smooth} ${commonStyles.btn} ${
              commonStyles[`btn-green`]
            }`}
            type="submit"
            value="Signup"
          />
        </div>
      </form>
    </Layout>
  );
}
