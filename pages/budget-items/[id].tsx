import get from "lodash.get";

import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import logger from "../../lib/logger";
import EntityForm from "../../components/entity-form";
import { ReduxState } from "../../redux/types";
import {
  updateEntity,
  syncFailure,
  syncRequest,
  sync,
  syncSuccess,
} from "../../redux/actions";

const log = logger();

export default function UpdateBudgetItem() {
  const router = useRouter();
  const id = router.query.id as string;

  const { logged, email, fund } = useSelector((state: ReduxState) => ({
    logged: state.logged,
    email: state.email,
    fund: state.budgetItems[id],
  }));

  const [name, setName] = useState(get(fund, "name", ""));
  const [amount, setAmount] = useState(get(fund, "amount", 0.0));

  const dispatch = useDispatch();

  function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(updateEntity("budgetItems", id, { name, amount }));
    router.push("/");

    if (!logged) {
      return;
    }

    dispatch(syncRequest);

    fund.synced
      ? fetch(`/api/budgetItems/${email}/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ name, amount }),
        })
          .then((response) => dispatch(response.ok ? syncSuccess : syncFailure))
          .catch((error) => log.error({ error: error.message }))
      : fetch(`/api/budgetItems/${email}`, {
          method: "POST",
          body: JSON.stringify({ name, amount }),
        })
          .then((response) => response.json())
          .then(({ id: backendId }) =>
            dispatch(sync(id, backendId, "budgetItems"))
          )
          .then(() => dispatch(syncSuccess))
          .catch((error) => {
            dispatch(syncFailure);
            log.error({ error: error.message });
          });
  }

  return (
    <EntityForm
      pageName={"Update budget item"}
      type="update"
      inputs={[
        {
          label: "Name",
          value: name,
          setter: setName,
        },
        {
          label: "Amount",
          value: amount,
          setter: setAmount,
        },
      ]}
      submitHandler={submitHandler}
    />
  );
}
