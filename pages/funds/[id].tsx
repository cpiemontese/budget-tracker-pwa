import get from "lodash.get";

import { useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import { ReduxState } from "../../redux/types";
import EntityUpdateForm from "../../components/entity-update-form";

export default function UpdateFund() {
  const router = useRouter();
  const id = router.query.id as string;

  const fund = useSelector((state: ReduxState) => state.funds[id]);

  const [name, setName] = useState(get(fund, "name", ""));
  const [amount, setAmount] = useState(get(fund, "amount", 0.0));

  return (
    <EntityUpdateForm
      pageName="Update fund"
      endpoint="funds"
      entityName="funds"
      inputs={[
        {
          label: "Name",
          type: "text",
          value: name,
          setter: setName,
        },
        {
          label: "Amount",
          type: "number",
          value: amount,
          setter: (value) => setAmount(parseFloat(value)),
        },
      ]}
      getData={() => ({
        name,
        amount,
      })}
    />
  );
}
