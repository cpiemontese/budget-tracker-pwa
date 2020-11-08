import Link from "next/link";

import InfoBlock from "./info-block";
import commonStyles from "../styles/common.module.css";
import { trashCan } from "../styles/svg";

export default function FundListItem({
  id,
  name,
  last,
  amount,
  deleteHandler,
}: {
  id: string;
  name: string;
  last: boolean;
  amount: string;
  deleteHandler: (id: string, entityName: "funds" | "budgetItems") => void;
}) {
  return (
    <li
      className={`${!last ? "mb-2" : ""} ${commonStyles["list-item"]} ${
        commonStyles["smooth"]
      }`}
    >
      <Link href={`/funds/[id]`} as={`/funds/${id}`} key={id}>
        <a className={`w-full ${commonStyles["anchor"]}`}>
          <InfoBlock name="Name" value={name} />
          <InfoBlock name="Amount" value={amount} />
        </a>
      </Link>
      <button
        className={`self-center text-gray-900 hover:text-black p-2 rounded ${commonStyles["smooth"]} ${commonStyles["btn-inverted"]} ${commonStyles["btn-red"]}`}
        onClick={() => deleteHandler(id, "funds")}
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
