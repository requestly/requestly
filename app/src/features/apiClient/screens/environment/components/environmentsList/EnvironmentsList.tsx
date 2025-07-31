import { useCallback, useState, useMemo } from "react";
import { SidebarListHeader } from "../../../apiClient/components/sidebar/components/sidebarListHeader/SidebarListHeader";
import { trackCreateEnvironmentClicked, trackEnvironmentCreated } from "../../analytics";
import { EmptyState } from "features/apiClient/screens/apiClient/components/sidebar/components/emptyState/EmptyState";
import { ListEmptySearchView } from "features/apiClient/screens/apiClient/components/sidebar/components/listEmptySearchView/ListEmptySearchView";
import { EnvironmentAnalyticsSource } from "../../types";
import { EnvironmentsListItem } from "./components/environmentsListItem/EnvironmentsListItem";
import { RQAPI } from "features/apiClient/types";
import { useApiClientContext } from "features/apiClient/contexts";
import { SidebarPlaceholderItem } from "features/apiClient/screens/apiClient/components/sidebar/components/SidebarPlaceholderItem/SidebarPlaceholderItem";
import { isGlobalEnvironment } from "../../utils";
import { ApiClientExportModal } from "features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal";
import { EnvironmentData } from "backend/environment/types";
import { toast } from "utils/Toast";
import { RBAC, useRBAC } from "features/rbac";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { EnvironmentViewTabSource } from "../environmentView/EnvironmentViewTabSource";
import { useCommand } from "features/apiClient/commands";
import { useAPIEnvironment } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import {
  parseEnvironmentsStore,
  parseEnvironmentState,
  parseEnvironmentStore,
} from "features/apiClient/commands/environments/utils";
import "./environmentsList.scss";

export const EnvironmentsList = () => {
  const [globalEnvironment, nonGlobalEnvironments, getEnvironment] = useAPIEnvironment((s) => [
    s.globalEnvironment,
    s.environments,
    s.getEnvironment,
  ]);

  const {
    env: { createEnvironment },
  } = useCommand();

  const [searchValue, setSearchValue] = useState("");
  const [environmentsToExport, setEnvironmentsToExport] = useState<EnvironmentData[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { setIsRecordBeingCreated, isRecordBeingCreated } = useApiClientContext();
  const { validatePermission, getRBACValidationFailureErrorMessage } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_environment", "update");
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);

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

  const createNewEnvironment = useCallback(
    async (environmentName?: string) => {
      setIsRecordBeingCreated(RQAPI.RecordType.ENVIRONMENT);

      try {
        const newEnvironment = await createEnvironment({ newEnvironmentName: environmentName || "New Environment" });

        openTab(new EnvironmentViewTabSource({ id: newEnvironment.id, title: newEnvironment.name }));
        trackEnvironmentCreated(filteredEnvironments.length, EnvironmentAnalyticsSource.ENVIRONMENTS_LIST);
      } catch (error) {
        toast.error("Failed to create environment. Please try again.");
      } finally {
        setIsRecordBeingCreated(null);
      }
    },
    [createEnvironment, filteredEnvironments.length, openTab, setIsRecordBeingCreated]
  );

  const handleAddEnvironmentClick = useCallback(async () => {
    if (!isValidPermission) {
      toast.warn(getRBACValidationFailureErrorMessage(RBAC.Permission.create, "environment"), 5);
      return;
    }

    trackCreateEnvironmentClicked(EnvironmentAnalyticsSource.ENVIRONMENTS_LIST);
    return createNewEnvironment();
  }, [createNewEnvironment, isValidPermission, getRBACValidationFailureErrorMessage]);

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

  return (
    <div style={{ height: "inherit" }}>
      {filteredEnvironments?.length === 0 ? (
        <div className="environments-empty-state-wrapper">
          <EmptyState
            onNewRecordClick={handleAddEnvironmentClick}
            message="No environment created yet"
            newRecordBtnText="Create new environment"
            analyticEventSource={EnvironmentAnalyticsSource.ENVIRONMENTS_LIST}
            disabled={!isValidPermission}
          />
        </div>
      ) : (
        <>
          <SidebarListHeader onSearch={(value) => setSearchValue(value)} />
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
        </>
      )}
    </div>
  );
};
