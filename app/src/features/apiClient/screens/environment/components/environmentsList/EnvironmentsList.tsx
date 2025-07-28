import { useCallback, useState, useMemo } from "react";
import { useEnvironment } from "features/apiClient/hooks/useEnvironment";
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
import "./environmentsList.scss";

export const EnvironmentsList = () => {
  const { addNewEnvironment, getAllEnvironments, setCurrentEnvironment, getEnvironmentById } = useEnvironment();
  const [searchValue, setSearchValue] = useState("");
  const [environmentsToExport, setEnvironmentsToExport] = useState<EnvironmentData[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { setIsRecordBeingCreated, isRecordBeingCreated } = useApiClientContext();
  const { validatePermission, getRBACValidationFailureErrorMessage } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_environment", "update");
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);

  const environments = useMemo(() => getAllEnvironments(), [getAllEnvironments]);
  const filteredEnvironments = useMemo(
    () =>
      environments
        .filter((environment) => environment.name?.toLowerCase().includes(searchValue?.toLowerCase()))
        .sort((a, b) => {
          if (isGlobalEnvironment(a.id)) return -1;
          if (isGlobalEnvironment(b.id)) return 1;
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        }),
    [environments, searchValue]
  );

  const createNewEnvironment = useCallback(
    async (environmentName?: string) => {
      setIsRecordBeingCreated(RQAPI.RecordType.ENVIRONMENT);

      return addNewEnvironment(environmentName || "New Environment")
        .then((newEnvironment) => {
          if (newEnvironment) {
            if (environments.length === 0) {
              setCurrentEnvironment(newEnvironment.id);
            }

            openTab(new EnvironmentViewTabSource({ id: newEnvironment.id, title: newEnvironment.name }));
            trackEnvironmentCreated(environments.length, EnvironmentAnalyticsSource.ENVIRONMENTS_LIST);
          }
        })
        .finally(() => {
          setIsRecordBeingCreated(null);
        });
    },
    [addNewEnvironment, environments.length, setCurrentEnvironment, openTab, setIsRecordBeingCreated]
  );

  const handleAddEnvironmentClick = useCallback(() => {
    if (!isValidPermission) {
      toast.warn(getRBACValidationFailureErrorMessage(RBAC.Permission.create, "environment"), 5);
      return;
    }

    trackCreateEnvironmentClicked(EnvironmentAnalyticsSource.ENVIRONMENTS_LIST);
    return createNewEnvironment();
  }, [createNewEnvironment, isValidPermission, getRBACValidationFailureErrorMessage]);

  const handleExportEnvironments = useCallback(
    (environment: { id: string; name: string }) => {
      const variables = getEnvironmentById(environment.id).variables;
      setEnvironmentsToExport([{ ...environment, variables }]);

      setIsExportModalOpen(true);
    },
    [getEnvironmentById]
  );

  return (
    <div style={{ height: "inherit" }}>
      {environments?.length === 0 ? (
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
                      <EnvironmentsListItem environment={environment} isReadOnly={!isValidPermission} />
                    ) : (
                      <EnvironmentsListItem
                        environment={environment}
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
