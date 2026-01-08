import type React from "react";
import type { EnvironmentVariables } from "backend/environment/types";
import type { ApiClientVariables } from "features/apiClient/slices/entities/api-client-variables";
import { VariablesList } from "../../VariablesList/VariablesList";

interface RuntimeVariablesListProps {
  variablesData: EnvironmentVariables;
  variables: ApiClientVariables<any, any>;
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
