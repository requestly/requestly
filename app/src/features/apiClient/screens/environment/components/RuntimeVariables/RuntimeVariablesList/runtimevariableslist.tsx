import React from "react";
import { VariableRow, VariablesList } from "../../VariablesList/VariablesList";
import { RuntimeVariableValue } from "features/apiClient/store/runtimeVariables/runtimeVariables.store";
import { EnvironmentVariableType } from "backend/environment/types";

interface RuntimeVariableProps {
  searchValue: string;
  onVariablesChange: (variables: any[]) => void;
  variables: any[];
}

export type RuntimeVariableTableRow = VariableRow<RuntimeVariableValue>;

const createNewVariable = (id: number, type: EnvironmentVariableType): RuntimeVariableTableRow => ({
  id,
  key: "",
  type,
  syncValue: "",
  isPersisted: false,
});

export const RuntimeVariablesList: React.FC<RuntimeVariableProps> = ({ searchValue, variables, onVariablesChange }) => {
  return (
    <VariablesList
      searchValue={searchValue}
      variables={variables}
      onVariablesChange={onVariablesChange}
      createNewVariable={createNewVariable}
      container="runtime"
    />
  );
};
