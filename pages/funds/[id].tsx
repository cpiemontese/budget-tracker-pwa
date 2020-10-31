import get from "lodash.get";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

import FundForm from "../../components/fund-form";
import EntityUpdateFormContext from "../../components/entity-update-form-context";
import { ReduxState } from "../../redux/types";

export default function UpdateFund() {
  const router = useRouter();
  const id = router.query.id as string;

  const fund = useSelector((state: ReduxState) => state.funds[id]);

  return (
    <EntityUpdateFormContext endpoint="funds" entityName="funds">
      {(submitHandler) => (
        <FundForm
          type="update"
          startingName={get(fund, "name", "")}
          startingAmount={get(fund, "amount", 0.0)}
          submitHandler={submitHandler}
        />
      )}
    </EntityUpdateFormContext>
  );
}
