import Link from "next/link";
import { budgetItemDateFormat } from "../lib/common";

import commonStyles from "../styles/common.module.css";
import { trashCan } from "../styles/svg";

const InfoBlock = ({ name, value }) => (
  <div className="sm:flex items-center mb-2">
    <div className="w-full sm:w-1/6 sm:pr-4 text-xs sm:text-right font-medium text-gray-700">
      {name}
    </div>
    <div className="w-full sm:w-5/6">{value}</div>
  </div>
);

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
        <a className={`w-full ${commonStyles["anchor"]}`}>
          <InfoBlock name="Name" value={name} />
          <InfoBlock name="Amount" value={amount} />
          <InfoBlock name="Date" value={budgetItemDateFormat(date)} />
          <InfoBlock
            name="Category"
            value={
              <p
                className="bg-blue-500 px-3 text-center text-white rounded-full"
                style={{ width: "max-content" }}
              >
                {category}
              </p>
            }
          />
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
