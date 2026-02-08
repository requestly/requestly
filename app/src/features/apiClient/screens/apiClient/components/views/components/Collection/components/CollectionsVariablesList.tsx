import type React from "react";
import { VariablesList } from "features/apiClient/screens/environment/components/VariablesList/VariablesList";
import type { EnvironmentVariables } from "backend/environment/types";
import type { ApiClientVariables } from "features/apiClient/slices/entities/api-client-variables";
import type { RQAPI } from "features/apiClient/types";
import type { ApiClientRootState } from "features/apiClient/slices/hooks/types";
import { useRBAC } from "features/rbac";

interface CollectionsVariablesListProps {
  variablesData: EnvironmentVariables;
  variables: ApiClientVariables<RQAPI.CollectionRecord, ApiClientRootState>;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
}

export const CollectionsVariablesList: React.FC<CollectionsVariablesListProps> = ({
  variablesData,
  variables,
  searchValue,
  onSearchValueChange,
}) => {
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_collection", "create");

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
