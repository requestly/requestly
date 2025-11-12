import React from "react";
import { VariablesList } from "../../VariablesList/VariablesList";

interface RuntimeVariableProps {
  searchValue: string;
  onVariablesChange: (variables: any[]) => void;
  variables: any[];
  onSearchValueChange: (value: string) => void;
}

export const RuntimeVariablesList: React.FC<RuntimeVariableProps> = ({
  searchValue,
  variables,
  onVariablesChange,
  onSearchValueChange,
}) => {
  return (
    <VariablesList
      searchValue={searchValue}
      variables={variables}
      onVariablesChange={onVariablesChange}
      container="runtime"
      onSearchValueChange={onSearchValueChange}
    />
  );
};
