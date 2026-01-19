import React, { useCallback, useState, useMemo } from "react";
import { ListEmptySearchView } from "features/apiClient/screens/apiClient/components/sidebar/components/listEmptySearchView/ListEmptySearchView";
import { EnvironmentsListItem } from "./components/environmentsListItem/EnvironmentsListItem";
import { RQAPI } from "features/apiClient/types";
import { useApiClientContext } from "features/apiClient/contexts";
import { SidebarPlaceholderItem } from "features/apiClient/screens/apiClient/components/sidebar/components/SidebarPlaceholderItem/SidebarPlaceholderItem";
import { ApiClientExportModal } from "features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal";
import { EnvironmentData } from "backend/environment/types";
import { useRBAC } from "features/rbac";
import { useGlobalEnvironment, useAllEnvironments } from "features/apiClient/slices/environments/environments.hooks";
import "./contextualEnvironmentsList.scss";
import { isGlobalEnvironment } from "features/apiClient/screens/environment/utils";
import { useWorkspaceId } from "features/apiClient/common/WorkspaceProvider";
import { EmptyEnvironmentsCreateCard } from "features/apiClient/screens/apiClient/components/sidebar/components/EmptyEnvironmentsCreateCard/EmptyEnvironmentsCreateCard";
import { Conditional } from "components/common/Conditional";
import { parseEnvironmentEntityToData } from "features/apiClient/slices/environments/utils";

interface ContextualEnvironmentsListProps {
  searchValue: string;
}

// TODO: EnvironmentsList can be used directly here with some additional props
export const ContextualEnvironmentsList: React.FC<ContextualEnvironmentsListProps> = ({ searchValue }) => {
  const globalEnvironment = useGlobalEnvironment();
  const allEnvironments = useAllEnvironments();
  const nonGlobalEnvironments = useMemo(() => allEnvironments.filter((env) => env.id !== globalEnvironment.id), [
    allEnvironments,
    globalEnvironment.id,
  ]);

  const [environmentsToExport, setEnvironmentsToExport] = useState<EnvironmentData[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { isRecordBeingCreated, onNewClickContextId } = useApiClientContext();
  const workspaceId = useWorkspaceId();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_environment", "update");

  const getEnvironment = useCallback(
    (id: string) => {
      if (id === globalEnvironment.id) {
        return globalEnvironment;
      }

      return allEnvironments.find((env) => env.id === id);
    },
    [globalEnvironment, allEnvironments]
  );

  const filteredEnvironments = useMemo(() => {
    const globalEnv = parseEnvironmentEntityToData(globalEnvironment);
    const parsedEnvs = nonGlobalEnvironments.map(parseEnvironmentEntityToData);

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
      const environmentEntity = getEnvironment(environment.id);
      if (!environmentEntity) {
        throw new Error("Environment not found!");
      }
      setEnvironmentsToExport([
        {
          id: environmentEntity.id,
          name: environmentEntity.name,
          variables: environmentEntity.variables,
        },
      ]);
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
                <EmptyEnvironmentsCreateCard workspaceId={workspaceId} isValidPermission={isValidPermission} />
              </Conditional>
              <div className="mt-8">
                {isRecordBeingCreated === RQAPI.RecordType.ENVIRONMENT && onNewClickContextId === workspaceId && (
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
