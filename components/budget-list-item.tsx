import Link from "next/link";
import { budgetItemDateFormat } from "../lib/common";

import commonStyles from "../styles/common.module.css";
import { trashCan } from "../styles/svg";

export default function BudgetListItem({
  id,
  name,
  last,
  amount,
  date,
  category,
  deleteHandler,
}: {
  id: string;
  name: string;
  last: boolean;
  amount: string;
  date: number;
  category: string;
  deleteHandler: (id: string, entityName: "funds" | "budgetItems") => void;
}) {
  return (
    <li
      className={`${!last ? "mb-2" : ""} ${commonStyles["list-item"]} ${
        commonStyles["smooth"]
      }`}
    >
      <Link href={`/budget-items/[id]`} as={`/budget-items/${id}`} key={id}>
        <a className={`w-full flex ${commonStyles["anchor"]}`}>
          <div className="w-1/5 mr-4 md:mr-0 font-medium text-gray-700">
            <p>Name</p>
            <p>Amount</p>
            <p>Date</p>
            <p>Category</p>
          </div>
          <div className="w-4/5">
            <p>{name}</p>
            <p>{amount}</p>
            <p>{budgetItemDateFormat(date)}</p>
            <p
              className="bg-blue-500 px-3 text-center text-white rounded-full"
              style={{ width: "max-content" }}
            >
              {category}
            </p>
          </div>
        </a>
      </Link>
      <button
        className={`self-center text-gray-900 hover:text-black p-2 rounded ${commonStyles["smooth"]} ${commonStyles["btn-inverted"]} ${commonStyles["btn-red"]}`}
        onClick={() => deleteHandler(id, "budgetItems")}
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
