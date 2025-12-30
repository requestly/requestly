import { VariablesList } from "./VariablesList";
import { useRBAC } from "features/rbac";
import React from "react";
import { EnvironmentVariables } from "backend/environment/types";
import { ApiClientVariables } from "features/apiClient/slices/entities/api-client-variables";

interface EnvironmentVariablesListProps {
  variablesData: EnvironmentVariables;
  variables: ApiClientVariables<any>;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
}

export const EnvironmentVariablesList: React.FC<EnvironmentVariablesListProps> = ({
  variablesData,
  variables,
  searchValue,
  onSearchValueChange,
}) => {
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_environment", "create");

  return (
    <VariablesList
      variablesData={variablesData}
      variables={variables}
      searchValue={searchValue}
      onSearchValueChange={onSearchValueChange}
      isReadOnly={!isValidPermission}
      container="environments"
    />
  );
};
