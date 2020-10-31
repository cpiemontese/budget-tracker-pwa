import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import logger from "../../lib/logger";
import { ReduxState } from "../../redux/types";
import {
  createEntity,
  syncFailure,
  syncRequest,
  sync,
  syncSuccess,
} from "../../redux/actions";
import EntityForm from "../../components/entity-form";
import { randomString } from "../../lib/common";

const log = logger();

export default function CreateFund() {
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
    const localId = randomString();
    dispatch(createEntity("funds", localId, { name, amount }));
    router.push("/");

    if (!logged) {
      return;
    }

    dispatch(syncRequest);
    fetch(`/api/funds/${email}`, {
      method: "POST",
      body: JSON.stringify({ name, amount }),
    })
      .then((response) => response.json())
      .then(({ id: backendId }) => dispatch(sync(localId, backendId, "funds")))
      .then(() => dispatch(syncSuccess))
      .catch((error) => {
        dispatch(syncFailure);
        log.error({ error: error.message });
      });
  }

  return (
    <EntityForm
      pageName={"Create a new fund"}
      type="create"
      name={name}
      amount={amount}
      setName={setName}
      setAmount={setAmount}
      submitHandler={submitHandler}
    />
  );
}
