import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import logger from "../lib/logger";
import commonStyles from "../styles/common.module.css";
import { trashCan } from "../styles/svg";
import { ReduxState } from "../redux/types";
import { deleteEntity, removeEntity } from "../redux/actions";

const log = logger({ browser: true });

export default function EntityListItem({
  id,
  name,
  amount,
  endpoint,
  entityName,
  deleteHandler,
}: {
  id: string;
  name: string;
  amount: string;
  endpoint: "funds" | "budget-items";
  entityName: "funds" | "budgetItems";
  deleteHandler: (id: string, entityName: "funds" | "budgetItems") => void;
}) {
  return (
    <li className={`${commonStyles["smooth"]} ${commonStyles["list-item"]}`}>
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
        className={`self-center text-gray-900 hover:text-black p-2 rounded ${commonStyles["smooth"]} ${commonStyles["btn-inverted"]} ${commonStyles["btn-red"]}`}
        onClick={() => deleteHandler(id, entityName)}
      >
        <svg
          className="fill-current"
          width="24"
          height="24"
          xmlns="http://www.w3.org/2000/svg"
          fillRule="evenodd"
          clipRule="evenodd"
          viewBox="0 0 24 24"
        >
          <path d={trashCan} />
        </svg>
      </button>
    </li>
  );
}
