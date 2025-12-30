import React from "react";
import { VariablesList } from "../../VariablesList/VariablesList";
import { EnvironmentVariables } from "backend/environment/types";
import { ApiClientVariables } from "features/apiClient/slices/entities/api-client-variables";

interface RuntimeVariablesListProps {
  variablesData: EnvironmentVariables;
  variables: ApiClientVariables<any>;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
}

export const RuntimeVariablesList: React.FC<RuntimeVariablesListProps> = ({
  variablesData,
  variables,
  searchValue,
  onSearchValueChange,
}) => {
  return (
    <VariablesList
      variablesData={variablesData}
      variables={variables}
      searchValue={searchValue}
      onSearchValueChange={onSearchValueChange}
      container="runtime"
    />
  );
};
