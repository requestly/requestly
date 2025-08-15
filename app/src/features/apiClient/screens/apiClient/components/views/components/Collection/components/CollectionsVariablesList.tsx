import { EnvironmentVariableType, EnvironmentVariableValue } from "backend/environment/types";
import {
  VariableRow,
  VariablesList,
} from "features/apiClient/screens/environment/components/VariablesList/VariablesList";
import React from "react";

interface CollectionsVariablesListProps {
  searchValue: string;
  onVariablesChange: (variables: any[]) => void;
  variables: any[];
}

export type EnvironmentVariableTableRow = VariableRow<EnvironmentVariableValue>;

const createNewVariable = (id: number, type: EnvironmentVariableType): EnvironmentVariableTableRow => ({
  id,
  key: "",
  type,
  localValue: "",
  syncValue: "",
});

export const CollectionsVariablesList: React.FC<CollectionsVariablesListProps> = ({
  searchValue,
  variables,
  onVariablesChange,
}) => {
  return (
    <VariablesList
      searchValue={searchValue}
      variables={variables}
      onVariablesChange={onVariablesChange}
      createNewVariable={createNewVariable}
      container="environments"
    />
  );
};
