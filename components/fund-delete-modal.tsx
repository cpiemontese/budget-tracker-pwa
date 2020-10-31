import { SetStateAction, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteEntity, removeEntity } from "../redux/actions";

import logger from "../lib/logger";
import commonStyles from "../styles/common.module.css";
import { ReduxState } from "../redux/types";

const log = logger({ browser: true });

export default function FundDeleteModal({
  id,
  setVisible,
}: {
  id: string;
  setVisible: (value: SetStateAction<boolean>) => void;
}) {
  const { funds, budgetItems } = useSelector((state: ReduxState) => ({
    funds: state.funds,
    budgetItems: state.budgetItems,
  }));

  const fundHasLinkedBIs = Object.keys(budgetItems).some(
    (key) => budgetItems[key].fund === id
  );

  const [newFundId, setNewFundId] = useState("");

  const { logged, email, fund } = useSelector((state: ReduxState) => ({
    logged: state.logged,
    email: state.email,
    fund: state.funds[id],
  }));

  const dispatch = useDispatch();

  function deleteFund() {
    dispatch(deleteEntity("funds", id, newFundId));

    if (!logged || !fund.synced) {
      return;
    }

    fetch(`/api/funds/${email}/${id}`, {
      method: "DELETE",
    })
      .then(() => dispatch(removeEntity("funds", id)))
      .catch((error) => log.error({ error: error.message }));
  }

  return (
    <div
      className={`w-full absolute z-10 p-4 rounded bg-white shadow-xl ${commonStyles.smooth}`}
    >
      <div className="pb-4 font-semibold text-xl">Deleting fund</div>
      {fundHasLinkedBIs && (
        <div className="pb-6">
          <div className="pb-2">
            This fund has some linked budget items! Select a new fund for them
          </div>
          <select
            className={`${commonStyles["form-input"]} ${commonStyles["smooth"]}`}
            value={newFundId}
            onChange={(event) => setNewFundId(event.target.value)}
          >
            {Object.keys(funds).map(
              (key) =>
                key !== id && <option value={key}>{funds[key].name}</option>
            )}
          </select>
        </div>
      )}
      <div className="pb-2">Are you sure?</div>
      <div className="flex items-center">
        <button
          className={`flex-1 mr-1 ${commonStyles.btn} ${commonStyles["btn-red"]} ${commonStyles.smooth}`}
          onClick={deleteFund}
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
