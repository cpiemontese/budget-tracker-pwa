import get from "lodash.get";

import { useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import EntityUpdateForm from "../../components/entity-update-form";

import { ReduxState } from "../../redux/types";

export default function UpdateBudgetItem() {
  const router = useRouter();
  const id = router.query.id as string;

  const { funds, budgetItem } = useSelector((state: ReduxState) => ({
    funds: state.funds,
    budgetItem: state.budgetItems[id],
  }));

  const [name, setName] = useState(get(budgetItem, "name", ""));
  const [amount, setAmount] = useState(get(budgetItem, "amount", 0.0));
  const [fundId, setFundId] = useState(get(budgetItem, "fund", ""));
  const [type, setType] = useState(get(budgetItem, "type", "expense"));
  const [category, setCategory] = useState(get(budgetItem, "category", ""));
  const [description, setDescription] = useState(
    get(budgetItem, "description", "")
  );

  return (
    <EntityUpdateForm
      pageName="Update budget item"
      endpoint="budget-items"
      entityName="budgetItems"
      inputs={[
        { label: "Name", type: "text", value: name, setter: setName },
        {
          label: "Fund",
          type: "text",
          value: get(funds, [fundId, "name"], "No fund"),
          setter: setFundId,
        },
        {
          label: "Amount",
          type: "number",
          value: amount,
          setter: (value) => setAmount(parseFloat(value)),
        },
        { label: "Type", type: "text", value: type, setter: setType },
        {
          label: "Category",
          type: "text",
          value: category,
          setter: setCategory,
        },
        {
          label: "Description",
          type: "text",
          value: description,
          setter: setDescription,
        },
      ]}
      getData={() => ({
        name,
        amount,
      })}
    />
  );
}
