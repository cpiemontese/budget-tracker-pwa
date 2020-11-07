import { SetStateAction } from "react";
import { useDispatch, useSelector } from "react-redux";

import logger from "../lib/logger";
import commonStyles from "../styles/common.module.css";
import { ReduxState } from "../redux/types";
import { deleteBudgetItem, removeEntity } from "../redux/actions";
import Modal from "./modal";

const log = logger({ browser: true });

export default function BudgetItemDeleteModal({
  id,
  visible,
  setVisible,
}: {
  id: string;
  visible: boolean;
  setVisible: (value: SetStateAction<boolean>) => void;
}) {
  const dispatch = useDispatch();

  const { logged, email, budgetitem } = useSelector((state: ReduxState) => ({
    logged: state.logged,
    email: state.email,
    budgetitem: state.budgetItems[id],
  }));

  function deleteHandler() {
    dispatch(deleteBudgetItem(id));
    setVisible(false);

    if (!logged || !budgetitem.synced) {
      return;
    }

    fetch(`/api/budget-items/${email}/${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "DELETE",
    })
      .then(() => dispatch(removeEntity("budgetItems", id)))
      .catch((error) => log.error({ error: error.message }));
  }

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      title={"Deleting budget item"}
      closeBtn={false}
    >
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
    </Modal>
  );
}
