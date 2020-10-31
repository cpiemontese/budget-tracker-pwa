import FundForm from "../../components/fund-form";
import EntityCreateFormContext from "../../components/entity-create-form-context";

export default function CreateFund() {
  return (
    <EntityCreateFormContext endpoint="funds" entityName="funds">
      {(submitHandler) => (
        <FundForm
          type="create"
          startingAmount={0.0}
          startingName=""
          submitHandler={submitHandler}
        />
      )}
    </EntityCreateFormContext>
  );
}
