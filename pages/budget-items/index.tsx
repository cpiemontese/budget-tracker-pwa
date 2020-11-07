import BudgetItemForm from "../../components/budget-item-form";
import EntityCreateFormContext from "../../components/entity-create-form-context";
import { budgetItemDateFormat } from "../../lib/common";

export default function CreateBudgetItem() {
  return (
    <EntityCreateFormContext endpoint="budget-items" entityName="budgetItems">
      {(submitHandler) => (
        <BudgetItemForm
          type="create"
          startingAmount={0.0}
          startingName=""
          startingFundId={null}
          startingType="expense"
          startingDate={budgetItemDateFormat(Date.now())}
          startingCategory=""
          startingDescription=""
          submitHandler={submitHandler}
        />
      )}
    </EntityCreateFormContext>
  );
}
