import { EnvironmentVariableType, EnvironmentVariableValue } from "backend/environment/types";
import { VariableRow, VariablesList } from "./VariablesList";
import { useRBAC } from "features/rbac";
import React from "react";

interface EnvironmentVariablesListProps {
  searchValue: string;
  pendingVariables: any[];
  handleSetPendingVariables: (variables: any[]) => void;
}

export type EnvironmentVariableTableRow = VariableRow<EnvironmentVariableValue>;

const createNewVariable = (id: number, type: EnvironmentVariableType): EnvironmentVariableTableRow => ({
  id,
  key: "",
  type,
  localValue: "",
  syncValue: "",
});

export const EnvironmentVariablesList: React.FC<EnvironmentVariablesListProps> = ({
  searchValue,
  pendingVariables,
  handleSetPendingVariables,
}) => {
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_environment", "create");

  return (
    <VariablesList
      searchValue={searchValue}
      variables={pendingVariables}
      onVariablesChange={handleSetPendingVariables}
      createNewVariable={createNewVariable}
      isReadOnly={!isValidPermission} // tobe omitted in runtime variable list
      container="environments"
    />
  );
};
