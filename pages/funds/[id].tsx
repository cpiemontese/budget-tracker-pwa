import get from "lodash.get";

import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import logger from "../../lib/logger";
import Fund from "../../components/fund";
import { ReduxState } from "../../redux/types";
import {
  updateFund,
  syncFailure,
  syncRequest,
  syncSuccess,
} from "../../redux/actions";

const log = logger();

export default function FundPage() {
  const router = useRouter();
  const id = router.query.id as string;

  const { logged, email, fund } = useSelector((state: ReduxState) => ({
    logged: state.logged,
    email: state.email,
    fund: state.funds[id],
  }));

  const [name, setName] = useState(get(fund, "name", ""));
  const [amount, setAmount] = useState(get(fund, "amount", 0.0));

  const dispatch = useDispatch();

  function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(updateFund(id, name, amount));
    router.push("/");

    if (logged) {
      dispatch(syncRequest);
      fetch(`/api/funds/${email}/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name, amount }),
      })
        .then((response) => dispatch(response.ok ? syncSuccess : syncFailure))
        .catch((error) => log.error({ error: error.message }));
    }
  }

  return (
    <Fund
      pageName={"Update fund"}
      name={name}
      amount={amount}
      setName={setName}
      setAmount={setAmount}
      submitHandler={submitHandler}
    />
  );
}
