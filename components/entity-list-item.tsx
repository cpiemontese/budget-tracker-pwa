import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import logger from "../lib/logger";
import commonStyles from "../styles/common.module.css";
import { deleteFund, removeFund } from "../redux/actions";
import { trashCan } from "../styles/svg";
import { ReduxState } from "../redux/types";

const actions = {
  funds: {
    delete: deleteFund,
    remove: removeFund,
  },
};

const log = logger();

export default function EntityListItem({
  id,
  name,
  amount,
  entityName,
}: {
  id: string;
  name: string;
  amount: string;
  entityName: "funds" | "budgetItems";
}) {
  const { logged, email, entity } = useSelector((state: ReduxState) => ({
    logged: state.logged,
    email: state.email,
    entity: state[entityName][id],
  }));

  const dispatch = useDispatch();

  function deleteEntity() {
    dispatch(actions[entityName].delete(id));

    if (!logged || !entity.synced) {
      return;
    }

    fetch(`/api/${entityName}/${email}/${id}`, {
      method: "DELETE",
    })
      .then(() => dispatch(actions[entityName].remove(id)))
      .catch((error) => log.error({ error: error.message }));
  }

  return (
    <li className={commonStyles["list-item"]} key={id}>
      <Link href={`/${entityName}/[id]`} as={`/${entityName}/${id}`} key={id}>
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
        onClick={deleteEntity}
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
