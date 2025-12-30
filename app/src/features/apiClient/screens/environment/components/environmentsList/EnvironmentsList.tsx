import { useCallback, useState, useMemo } from "react";
import { SidebarListHeader } from "../../../apiClient/components/sidebar/components/sidebarListHeader/SidebarListHeader";
import { ListEmptySearchView } from "features/apiClient/screens/apiClient/components/sidebar/components/listEmptySearchView/ListEmptySearchView";
import { EnvironmentsListItem, ExportType } from "./components/environmentsListItem/EnvironmentsListItem";
import { RQAPI } from "features/apiClient/types";
import { useApiClientContext } from "features/apiClient/contexts";
import { SidebarPlaceholderItem } from "features/apiClient/screens/apiClient/components/sidebar/components/SidebarPlaceholderItem/SidebarPlaceholderItem";
import { isGlobalEnvironment } from "../../utils";
import { ApiClientExportModal } from "features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal";
import { PostmanEnvironmentExportModal } from "features/apiClient/screens/apiClient/components/modals/postmanEnvironmentExportModal/PostmanEnvironmentExportModal";
import { EnvironmentData } from "backend/environment/types";
import { useRBAC } from "features/rbac";
import { useGlobalEnvironment, useAllEnvironments } from "features/apiClient/slices/environments/environments.hooks";
import "./environmentsList.scss";
import { ApiClientSidebarTabKey } from "features/apiClient/screens/apiClient/components/sidebar/SingleWorkspaceSidebar/SingleWorkspaceSidebar";
import { EmptyEnvironmentsCreateCard } from "features/apiClient/screens/apiClient/components/sidebar/components/EmptyEnvironmentsCreateCard/EmptyEnvironmentsCreateCard";
import { Conditional } from "components/common/Conditional";
import { EnvironmentEntity } from "features/apiClient/slices/environments/types";
import { useWorkspaceId } from "features/apiClient/common/WorkspaceProvider";

function parseEnvironmentEntityToData(env: EnvironmentEntity): EnvironmentData {
  return {
    id: env.id,
    name: env.name,
    variables: env.variables,
  };
}

export const EnvironmentsList = () => {
  const workspaceId = useWorkspaceId();
  const globalEnvironment = useGlobalEnvironment();
  const allEnvironments = useAllEnvironments();
  const nonGlobalEnvironments = allEnvironments.filter((env) => env.id !== globalEnvironment.id);

  const [searchValue, setSearchValue] = useState("");
  const [environmentsToExport, setEnvironmentsToExport] = useState<EnvironmentData[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPostmanExportModalOpen, setIsPostmanExportModalOpen] = useState(false);
  const { isRecordBeingCreated, onNewClick } = useApiClientContext();
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
    (environment: { id: string; name: string }, exportType: ExportType) => {
      const environmentEntity = getEnvironment(environment.id);
      if (!environmentEntity) {
        throw new Error("Environment not found!");
      }
      setEnvironmentsToExport([parseEnvironmentEntityToData(environmentEntity)]);

      switch (exportType) {
        case ExportType.REQUESTLY:
          setIsExportModalOpen(true);
          break;
        case ExportType.POSTMAN:
          setIsPostmanExportModalOpen(true);
          break;
        default:
          console.warn(`Unknown export type: ${exportType}`);
      }
    },
    [getEnvironment]
  );

  const showEmptyCreateCard =
    searchValue.length === 0 && nonGlobalEnvironments.length === 0 && !isRecordBeingCreated && isValidPermission;

  return (
    <div style={{ height: "inherit" }}>
      <SidebarListHeader
        listType={ApiClientSidebarTabKey.ENVIRONMENTS}
        onSearch={(value) => setSearchValue(value)}
        newRecordActionOptions={{
          showNewRecordAction: false,
          onNewRecordClick: onNewClick,
        }}
      />

      <div className="environments-list-container">
        <div className="environments-list">
          {searchValue.length > 0 && filteredEnvironments.length === 0 ? (
            <ListEmptySearchView message="No environments found. Try searching with a different name" />
          ) : (
            <>
              {filteredEnvironments.map((environment) => {
                return isGlobalEnvironment(environment.id) ? (
                  <EnvironmentsListItem
                    key={environment.id}
                    environmentId={environment.id}
                    isReadOnly={!isValidPermission}
                    isGlobal={true}
                  />
                ) : (
                  <EnvironmentsListItem
                    key={environment.id}
                    environmentId={environment.id}
                    isReadOnly={!isValidPermission}
                    onExportClick={handleExportEnvironments}
                    isGlobal={false}
                  />
                );
              })}
              <Conditional condition={showEmptyCreateCard}>
                <EmptyEnvironmentsCreateCard workspaceId={workspaceId} isValidPermission={isValidPermission} />
              </Conditional>
              <div className="mt-8">
                {isRecordBeingCreated === RQAPI.RecordType.ENVIRONMENT && (
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
      {isPostmanExportModalOpen && (
        <PostmanEnvironmentExportModal
          environments={environmentsToExport}
          isOpen={isPostmanExportModalOpen}
          onClose={() => {
            setEnvironmentsToExport([]);
            setIsPostmanExportModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
