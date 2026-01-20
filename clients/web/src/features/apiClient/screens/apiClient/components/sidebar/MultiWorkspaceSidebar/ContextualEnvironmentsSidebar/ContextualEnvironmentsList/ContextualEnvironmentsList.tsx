import React, { useCallback, useState, useMemo } from "react";
import { ListEmptySearchView } from "features/apiClient/screens/apiClient/components/sidebar/components/listEmptySearchView/ListEmptySearchView";
import { EnvironmentsListItem } from "./components/environmentsListItem/EnvironmentsListItem";
import { RQAPI } from "features/apiClient/types";
import { useApiClientContext } from "features/apiClient/contexts";
import { SidebarPlaceholderItem } from "features/apiClient/screens/apiClient/components/sidebar/components/SidebarPlaceholderItem/SidebarPlaceholderItem";
import { ApiClientExportModal } from "features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal";
import { EnvironmentData } from "backend/environment/types";
import { useRBAC } from "features/rbac";
import { useAPIEnvironment } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import {
  parseEnvironmentsStore,
  parseEnvironmentState,
  parseEnvironmentStore,
} from "features/apiClient/commands/environments/utils";
import "./contextualEnvironmentsList.scss";
import { isGlobalEnvironment } from "features/apiClient/screens/environment/utils";
import { useContextId } from "features/apiClient/contexts/contextId.context";
import { EmptyEnvironmentsCreateCard } from "features/apiClient/screens/apiClient/components/sidebar/components/EmptyEnvironmentsCreateCard/EmptyEnvironmentsCreateCard";
import { Conditional } from "components/common/Conditional";

interface ContextualEnvironmentsListProps {
  searchValue: string;
}

export const ContextualEnvironmentsList: React.FC<ContextualEnvironmentsListProps> = ({ searchValue }) => {
  const [globalEnvironment, nonGlobalEnvironments, getEnvironment] = useAPIEnvironment((s) => [
    s.globalEnvironment,
    s.environments,
    s.getEnvironment,
  ]);

  const [environmentsToExport, setEnvironmentsToExport] = useState<EnvironmentData[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { isRecordBeingCreated, onNewClickContextId } = useApiClientContext();
  const contextId = useContextId();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_environment", "update");

  const filteredEnvironments = useMemo(() => {
    const globalEnv = parseEnvironmentStore(globalEnvironment);
    const parsedEnvs = parseEnvironmentsStore(nonGlobalEnvironments);

    return [
      globalEnv,
      ...parsedEnvs
        .filter((environment) => environment.name?.toLowerCase().includes(searchValue?.toLowerCase()))
        .sort((a, b) => {
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        }),
    ];
  }, [globalEnvironment, nonGlobalEnvironments, searchValue]);

  const handleExportEnvironments = useCallback(
    (environment: { id: string; name: string }) => {
      const environmentState = getEnvironment(environment.id);
      if (!environmentState) {
        throw new Error("Environment not found!");
      }
      const variables = parseEnvironmentState(environmentState).variables;
      setEnvironmentsToExport([{ ...environment, variables }]);

      setIsExportModalOpen(true);
    },
    [getEnvironment]
  );

  const showEmptyCreateCard =
    searchValue.length === 0 && nonGlobalEnvironments.length === 0 && !isRecordBeingCreated && isValidPermission;

  return (
    <>
      <div className="environments-list-container">
        <div className="environments-list">
          {searchValue.length > 0 && filteredEnvironments.length === 0 ? (
            <ListEmptySearchView message="No environments found. Try searching with a different name" />
          ) : (
            <>
              {filteredEnvironments.map((environment) =>
                isGlobalEnvironment(environment.id) ? (
                  <EnvironmentsListItem environmentId={environment.id} isReadOnly={!isValidPermission} />
                ) : (
                  <EnvironmentsListItem
                    environmentId={environment.id}
                    isReadOnly={!isValidPermission}
                    onExportClick={handleExportEnvironments}
                  />
                )
              )}
              <Conditional condition={showEmptyCreateCard}>
                <EmptyEnvironmentsCreateCard contextId={contextId} isValidPermission={isValidPermission} />
              </Conditional>
              <div className="mt-8">
                {isRecordBeingCreated === RQAPI.RecordType.ENVIRONMENT && onNewClickContextId === contextId && (
                  <SidebarPlaceholderItem name="New Environment" />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {isExportModalOpen && (
        <ApiClientExportModal
          exportType="environment"
          environments={environmentsToExport}
          isOpen={isExportModalOpen}
          onClose={() => {
            setIsExportModalOpen(false);
          }}
        />
      )}
    </>
  );
};
