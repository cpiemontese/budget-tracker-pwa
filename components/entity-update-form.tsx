import { FormEvent } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

import logger from "../lib/logger";
import { ReduxBudgetItem, ReduxFund, ReduxState } from "../redux/types";
import {
  updateEntity,
  sync,
  syncRequest,
  syncSuccess,
  syncFailure,
} from "../redux/actions";

const log = logger({ browser: true });

export default function EntityUpdateForm({
  endpoint,
  entityName,
  getData,
  children,
}: {
  endpoint: "funds" | "budget-items";
  entityName: "funds" | "budgetItems";
  getData: () => object;
  children: any;
}) {
  const router = useRouter();
  const id = router.query.id as string;

  const { logged, email, entity } = useSelector((state: ReduxState) => ({
    logged: state.logged,
    email: state.email,
    entity: state[entityName][id] as ReduxFund | ReduxBudgetItem,
  }));

  const dispatch = useDispatch();

  function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(updateEntity(entityName, id, getData()));
    router.push("/");

    if (!logged) {
      return;
    }

    dispatch(syncRequest);

    if (entity.synced) {
      return fetch(`/api/${endpoint}/${email}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(getData()),
      })
        .then((response) => dispatch(response.ok ? syncSuccess : syncFailure))
        .catch((error) => log.error({ error: error.message }));
    }

    return fetch(`/api/${endpoint}/${email}`, {
      method: "POST",
      body: JSON.stringify(getData()),
    })
      .then((response) => response.json())
      .then(({ id: backendId }) => dispatch(sync(id, backendId, entityName)))
      .then(() => dispatch(syncSuccess))
      .catch((error) => {
        dispatch(syncFailure);
        log.error({ error: error.message });
      });
  }

  return children(submitHandler);
}
