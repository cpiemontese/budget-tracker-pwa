import { SetStateAction, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteFund, removeEntity } from "../redux/actions";

import logger from "../lib/logger";
import commonStyles from "../styles/common.module.css";
import { ReduxState } from "../redux/types";

const log = logger({ browser: true });
const DELETE_ALL = "delete-all";

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

  const anotherFundId = Object.keys(funds).find(
    (key) => key !== id && !funds[key].deleted
  );

  const thereExistOtherFunds =
    anotherFundId !== null && anotherFundId !== undefined;
  const [substituteId, setSubstitute] = useState(anotherFundId ?? DELETE_ALL);

  const { logged, email, fund } = useSelector((state: ReduxState) => ({
    logged: state.logged,
    email: state.email,
    fund: state.funds[id],
  }));

  const dispatch = useDispatch();

  function deleteHandler() {
    dispatch(deleteFund(id, substituteId));
    setVisible(false);

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
    <div className={commonStyles["modal"]}>
      <div className="mb-4 font-semibold text-xl">Deleting fund</div>
      {fundHasLinkedBIs && (
        <div className="mb-4">
          <div className="mb-2">This fund has some linked budget items!</div>
          <div className="mb-2">
            {thereExistOtherFunds
              ? "Select a new fund to move them to (or delete them all)"
              : "⚠️ If you proceed they will be deleted ⚠️"}
          </div>
          {thereExistOtherFunds && (
            <select
              className={`${commonStyles["form-input"]} ${commonStyles["smooth"]}`}
              value={substituteId}
              onChange={(event) => setSubstitute(event.target.value)}
            >
              <option key={DELETE_ALL} value={DELETE_ALL}>
                Delete all
              </option>
              {Object.keys(funds).map(
                (key) =>
                  key !== id && (
                    <option key={key} value={key}>
                      {funds[key].name}
                    </option>
                  )
              )}
            </select>
          )}
        </div>
      )}
      <div className="mb-2">Are you sure?</div>
      <div className="flex items-center">
        <button
          className={`flex-1 mr-1 ${commonStyles.btn} ${commonStyles["btn-red"]} ${commonStyles.smooth}`}
          onClick={deleteHandler}
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
