import { VariablesList } from "./VariablesList";
import { useRBAC } from "features/rbac";
import React from "react";

interface EnvironmentVariablesListProps {
  searchValue: string;
  pendingVariables: any[];
  handleSetPendingVariables: (variables: any[]) => void;
  onSearchValueChange: (value: string) => void;
}

export const EnvironmentVariablesList: React.FC<EnvironmentVariablesListProps> = ({
  searchValue,
  pendingVariables,
  handleSetPendingVariables,
  onSearchValueChange,
}) => {
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_environment", "create");

  return (
    <VariablesList
      searchValue={searchValue}
      variables={pendingVariables}
      onVariablesChange={handleSetPendingVariables}
      isReadOnly={!isValidPermission} // tobe omitted in runtime variable list
      container="environments"
      onSearchValueChange={onSearchValueChange}
    />
  );
};
