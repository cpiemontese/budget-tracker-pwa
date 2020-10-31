import { FormEvent } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

import logger from "../lib/logger";
import { ReduxState } from "../redux/types";
import { randomString } from "../lib/common";
import {
  sync,
  syncRequest,
  syncSuccess,
  syncFailure,
  createEntity,
} from "../redux/actions";

const log = logger({ browser: true });

export default function EntityCreateForm({
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

  const { logged, email } = useSelector((state: ReduxState) => ({
    logged: state.logged,
    email: state.email,
  }));

  const dispatch = useDispatch();

  function submitHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const localId = randomString();
    dispatch(createEntity(entityName, localId, getData()));
    router.push("/");

    if (!logged) {
      return;
    }

    dispatch(syncRequest);
    fetch(`/api/${endpoint}/${email}`, {
      method: "POST",
      body: JSON.stringify(getData()),
    })
      .then((response) => response.json())
      .then(({ id: backendId }) =>
        dispatch(sync(localId, backendId, entityName))
      )
      .then(() => dispatch(syncSuccess))
      .catch((error) => {
        dispatch(syncFailure);
        log.error({ error: error.message });
      });
  }

  return children(submitHandler);
}
