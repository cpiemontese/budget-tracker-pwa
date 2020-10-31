import { SetStateAction } from "react";

import commonStyles from "../styles/common.module.css";

export default function BudgeItemDeleteModal({
  id,
  setVisible,
}: {
  id: string;
  setVisible: (value: SetStateAction<boolean>) => void;
}) {
  return (
    <div
      className={`w-full absolute z-10 p-4 rounded bg-white shadow-xl ${commonStyles.smooth}`}
    >
      <div className="pb-4 font-semibold text-xl">Deleting budget item</div>
      <div className="pb-2">Are you sure?</div>
      <div className="flex items-center">
        <button
          className={`flex-1 mr-1 ${commonStyles.btn} ${commonStyles["btn-red"]} ${commonStyles.smooth}`}
        >
          Delete
        </button>
        <button
          className={`flex-1 ml-1 ${commonStyles.btn} ${commonStyles["btn-blue"]} ${commonStyles.smooth}`}
          onClick={() => setVisible(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
