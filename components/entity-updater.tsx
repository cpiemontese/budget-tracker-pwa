import get from "lodash.get";

import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import EntityForm from "./entity-form";
import logger from "../lib/logger";
import { ReduxState } from "../redux/types";
import {
  updateEntity,
  sync,
  syncRequest,
  syncSuccess,
  syncFailure,
} from "../redux/actions";

const actions = {
  funds: {
    update: updateEntity,
  },
};

const log = logger();

export default function UpdateEntity({
  pageName,
  endpoint,
  entityName,
}: {
  pageName: string;
  endpoint: "funds" | "budget-items";
  entityName: "funds" | "budgetItems";
}) {
  const router = useRouter();
  const id = router.query.id as string;

  const { logged, email, entity } = useSelector((state: ReduxState) => ({
    logged: state.logged,
    email: state.email,
    entity: state[entityName][id],
  }));

  const [name, setName] = useState(get(entity, "name", ""));
  const [amount, setAmount] = useState(get(entity, "amount", 0.0));

  const dispatch = useDispatch();

  function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(updateEntity(entityName, id, { name, amount }));
    router.push("/");

    if (!logged) {
      return;
    }

    dispatch(syncRequest);

    entity.synced
      ? fetch(`/api/${endpoint}/${email}/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ name, amount }),
        })
          .then((response) => dispatch(response.ok ? syncSuccess : syncFailure))
          .catch((error) => log.error({ error: error.message }))
      : fetch(`/api/${endpoint}/${email}`, {
          method: "POST",
          body: JSON.stringify({ name, amount }),
        })
          .then((response) => response.json())
          .then(({ id: backendId }) =>
            dispatch(sync(id, backendId, entityName))
          )
          .then(() => dispatch(syncSuccess))
          .catch((error) => {
            dispatch(syncFailure);
            log.error({ error: error.message });
          });
  }

  return (
    <EntityForm
      pageName={pageName}
      type="update"
      name={name}
      amount={amount}
      setName={setName}
      setAmount={setAmount}
      submitHandler={submitHandler}
    />
  );
}
