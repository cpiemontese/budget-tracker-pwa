import get from "lodash.get";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import BudgetItemForm from "../../components/budget-item-form";
import EntityUpdateFormContext from "../../components/entity-update-form-context";
import { budgetItemDateFormat } from "../../lib/common";
import { ReduxState } from "../../redux/types";

export default function UpdateBudgetItem() {
  const router = useRouter();
  const id = router.query.id as string;

  const { budgetItem } = useSelector((state: ReduxState) => ({
    funds: state.funds,
    budgetItem: state.budgetItems[id],
  }));

  return (
    <EntityUpdateFormContext endpoint="budget-items" entityName="budgetItems">
      {(submitHandler) => (
        <BudgetItemForm
          type="update"
          startingName={get(budgetItem, "name", "")}
          startingAmount={get(budgetItem, "amount", 0.0)}
          startingFundId={get(budgetItem, "fund", "")}
          startingType={get(budgetItem, "type", "expense")}
          startingDate={get(budgetItem, "date", Date.now())}
          startingCategory={get(budgetItem, "category", "")}
          startingDescription={get(budgetItem, "description", "")}
          submitHandler={submitHandler}
        />
      )}
    </EntityUpdateFormContext>
  );
}
