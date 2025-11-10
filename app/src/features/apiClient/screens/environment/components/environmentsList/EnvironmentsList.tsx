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
import { useAPIEnvironment } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import {
  parseEnvironmentsStore,
  parseEnvironmentState,
  parseEnvironmentStore,
} from "features/apiClient/commands/environments/utils";
import "./environmentsList.scss";
import { ApiClientSidebarTabKey } from "features/apiClient/screens/apiClient/components/sidebar/SingleWorkspaceSidebar/SingleWorkspaceSidebar";
import { useCommand } from "features/apiClient/commands";
import { RQButton } from "lib/design-system-v2/components";
import { trackNewEnvironmentClicked } from "modules/analytics/events/features/apiClient";
import { toast } from "utils/Toast";
import { EnvironmentViewTabSource } from "features/apiClient/screens/environment/components/environmentView/EnvironmentViewTabSource";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { useContextId } from "features/apiClient/contexts/contextId.context";

export const EnvironmentsList = () => {
  const [globalEnvironment, nonGlobalEnvironments, getEnvironment] = useAPIEnvironment((s) => [
    s.globalEnvironment,
    s.environments,
    s.getEnvironment,
  ]);

  const [searchValue, setSearchValue] = useState("");
  const [environmentsToExport, setEnvironmentsToExport] = useState<EnvironmentData[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPostmanExportModalOpen, setIsPostmanExportModalOpen] = useState(false);
  const { isRecordBeingCreated, onNewClick } = useApiClientContext();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_environment", "update");
  const {
    env: { createEnvironment },
  } = useCommand();
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);
  const contextId = useContextId();
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
    (environment: { id: string; name: string }, exportType: ExportType) => {
      const environmentState = getEnvironment(environment.id);
      if (!environmentState) {
        throw new Error("Environment not found!");
      }
      const variables = parseEnvironmentState(environmentState).variables;
      setEnvironmentsToExport([{ ...environment, variables }]);

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
              {filteredEnvironments.map((environment) =>
                isGlobalEnvironment(environment.id) ? (
                  <EnvironmentsListItem
                    key={environment.id}
                    environmentId={environment.id}
                    isReadOnly={!isValidPermission}
                  />
                ) : (
                  <EnvironmentsListItem
                    key={environment.id}
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
