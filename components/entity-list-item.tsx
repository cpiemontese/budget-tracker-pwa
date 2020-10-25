import Link from "next/link";
import commonStyles from "../styles/common.module.css";
import { trashCan } from "../styles/svg";

export default function EntityListItem({
  id,
  name,
  amount,
  entityName,
}: {
  id: string;
  name: string;
  amount: string;
  entityName: string;
}) {
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
      <button className="self-center bg-red-500 hover:bg-red-600 text-gray-900 hover:text-black focus:bg-red-700 p-2 rounded">
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
