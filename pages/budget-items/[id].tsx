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
        { label: "Name", value: name, setter: setName },
        {
          label: "Fund",
          value: get(funds, [fundId, "name"], "No fund"),
          setter: setFundId,
        },
        { label: "Amount", value: amount, setter: setAmount },
        { label: "Type", value: type, setter: setType },
        { label: "Category", value: category, setter: setCategory },
        { label: "Description", value: description, setter: setDescription },
      ]}
      getData={() => ({
        name,
        amount,
      })}
    />
  );
}
