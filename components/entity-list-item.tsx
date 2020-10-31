import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import logger from "../lib/logger";
import commonStyles from "../styles/common.module.css";
import { deleteEntity, removeEntity } from "../redux/actions";
import { trashCan } from "../styles/svg";
import { ReduxState } from "../redux/types";

const log = logger({ browser: true });

export default function EntityListItem({
  id,
  name,
  amount,
  endpoint,
  entityName,
}: {
  id: string;
  name: string;
  amount: string;
  endpoint: "funds" | "budget-items";
  entityName: "funds" | "budgetItems";
}) {
  const { logged, email, entity } = useSelector((state: ReduxState) => ({
    logged: state.logged,
    email: state.email,
    entity: state[entityName][id],
  }));

  const dispatch = useDispatch();

  function deleteHandler() {
    dispatch(deleteEntity(entityName, id));

    if (!logged || !entity.synced) {
      return;
    }

    fetch(`/api/${endpoint}/${email}/${id}`, {
      method: "DELETE",
    })
      .then(() => dispatch(removeEntity(entityName, id)))
      .catch((error) => log.error({ error: error.message }));
  }

  return (
    <li className={commonStyles["list-item"]} key={id}>
      <Link href={`/${endpoint}/[id]`} as={`/${endpoint}/${id}`} key={id}>
        <a className={`w-full flex ${commonStyles["anchor"]}`}>
          <div className="w-1/4 mr-4 md:mr-0 font-bold">
            <p>Name</p>
            <p>Amount</p>
          </div>
          <div className="w-3/4">
            <p>{name}</p>
            <p>{amount}</p>
          </div>
        </a>
      </Link>
      <button
        className="self-center bg-red-500 hover:bg-red-600 text-gray-900 hover:text-black focus:bg-red-700 p-2 rounded"
        onClick={deleteHandler}
      >
        <svg
          className="fill-current"
          width="24"
          height="24"
          xmlns="http://www.w3.org/2000/svg"
          fill-rule="evenodd"
          clip-rule="evenodd"
          viewBox="0 0 24 24"
        >
          <path d={trashCan} />
        </svg>
      </button>
    </li>
  );
}
