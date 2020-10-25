import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import logger from "../../lib/logger";
import { ReduxState } from "../../redux/types";
import {
  createFund,
  syncFailure,
  syncRequest,
  syncSuccess,
} from "../../redux/actions";
import Fund from "../../components/fund";

const log = logger();

export default function FundPage() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0.0);
  const router = useRouter();

  const { logged, email } = useSelector((state: ReduxState) => ({
    logged: state.logged,
    email: state.email,
  }));

  const dispatch = useDispatch();

  function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(createFund(name, amount));
    router.push("/");

    if (logged) {
      dispatch(syncRequest);
      fetch(`/api/funds/${email}`, {
        method: "POST",
        body: JSON.stringify({ name, amount }),
      })
        .then((response) => dispatch(response.ok ? syncSuccess : syncFailure))
        .catch((error) => log.error({ error: error.message }));
    }
  }

  return (
    <Fund
      pageName={"Create a new fund"}
      name={name}
      amount={amount}
      setName={setName}
      setAmount={setAmount}
      submitHandler={submitHandler}
    />
  );
}
