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
import { useCommand } from "features/apiClient/commands";
import { RQButton } from "lib/design-system-v2/components";
import { trackNewEnvironmentClicked } from "modules/analytics/events/features/apiClient";
import { toast } from "utils/Toast";
import { EnvironmentViewTabSource } from "features/apiClient/screens/environment/components/environmentView/EnvironmentViewTabSource";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";

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
  const {
    env: { createEnvironment },
  } = useCommand();
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);
  const [isCreatingEnvironment, setIsCreatingEnvironment] = useState(false);

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

  const handleCreateEnvironment = useCallback(async () => {
    if (isCreatingEnvironment || !isValidPermission) return;

    try {
      setIsCreatingEnvironment(true);
      trackNewEnvironmentClicked();
      const { id, name } = await createEnvironment({ newEnvironmentName: "New Environment" });
      openTab(new EnvironmentViewTabSource({ id, title: name, isNewTab: true, context: { id: contextId } }));
      toast.success("Environment created");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create environment");
    } finally {
      setIsCreatingEnvironment(false);
    }
  }, [createEnvironment, openTab, contextId, isCreatingEnvironment, isValidPermission]);

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
              {showEmptyCreateCard && (
                <div className="environments-empty-create-card">
                  <div className="environments-empty-create-card__text">No environment created yet</div>
                  <RQButton
                    size="small"
                    type="secondary"
                    onClick={handleCreateEnvironment}
                    loading={isCreatingEnvironment}
                    disabled={isCreatingEnvironment}
                  >
                    {isCreatingEnvironment ? "Creating..." : "Create environment"}
                  </RQButton>
                </div>
              )}
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
