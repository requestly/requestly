import { VariablesList } from "features/apiClient/screens/environment/components/VariablesList/VariablesList";
import React from "react";

interface CollectionsVariablesListProps {
  searchValue: string;
  onVariablesChange: (variables: any[]) => void;
  variables: any[];
}

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
      container="environments"
    />
  );
};
