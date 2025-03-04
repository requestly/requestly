import { useCallback, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useDispatch, useSelector } from "react-redux";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { SidebarListHeader } from "../../../apiClient/components/sidebar/components/sidebarListHeader/SidebarListHeader";
import PATHS from "config/constants/sub/paths";
import { trackCreateEnvironmentClicked, trackEnvironmentCreated } from "../../analytics";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";
import { EmptyState } from "features/apiClient/screens/apiClient/components/sidebar/components/emptyState/EmptyState";
import { ListEmptySearchView } from "features/apiClient/screens/apiClient/components/sidebar/components/listEmptySearchView/ListEmptySearchView";
import { EnvironmentAnalyticsSource } from "../../types";
import { EnvironmentsListItem } from "./components/environmentsListItem/EnvironmentsListItem";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import { RQAPI } from "features/apiClient/types";
import { useApiClientContext } from "features/apiClient/contexts";
import { SidebarPlaceholderItem } from "features/apiClient/screens/apiClient/components/sidebar/components/SidebarPlaceholderItem/SidebarPlaceholderItem";
import "./environmentsList.scss";
import { isGlobalEnvironment } from "../../utils";
import { ApiClientExportModal } from "features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal";
import { EnvironmentData } from "backend/environment/types";
import { toast } from "utils/Toast";
import { useRBAC } from "features/rbac";

export const EnvironmentsList = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(getUserAuthDetails);
  const {
    getAllEnvironments,
    addNewEnvironment,
    setCurrentEnvironment,
    getEnvironmentVariables,
  } = useEnvironmentManager();
  const [searchValue, setSearchValue] = useState("");
  const [environmentsToExport, setEnvironmentsToExport] = useState<EnvironmentData[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { setIsRecordBeingCreated, isRecordBeingCreated } = useApiClientContext();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_environment", "update");

  const { openTab, replaceTab } = useTabsLayoutContext();

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

            const targetPath = `${PATHS.API_CLIENT.ENVIRONMENTS.ABSOLUTE}/${encodeURIComponent(newEnvironment.id)}`;
            const tabConfig = {
              id: newEnvironment.id,
              title: newEnvironment.name,
              url: targetPath,
            };

            if (location.pathname.includes(PATHS.API_CLIENT.ENVIRONMENTS.NEW.RELATIVE)) {
              replaceTab("environments/new", tabConfig);
            } else {
              openTab(newEnvironment.id, tabConfig);
            }

            trackEnvironmentCreated(environments.length, EnvironmentAnalyticsSource.ENVIRONMENTS_LIST);
          }
        })
        .finally(() => {
          setIsRecordBeingCreated(null);
        });
    },
    [
      addNewEnvironment,
      environments.length,
      setCurrentEnvironment,
      replaceTab,
      openTab,
      location.pathname,
      setIsRecordBeingCreated,
    ]
  );

  const handleAddEnvironmentClick = useCallback(() => {
    if (!isValidPermission) {
      toast.warn(
        `As a viewer, you cannot create new environment. Contact your workspace admin to request an update to your role.`,
        5
      );
      return;
    }

    if (!user.loggedIn) {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            eventSource: EnvironmentAnalyticsSource.ENVIRONMENTS_LIST,
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
            warningMessage: "Please log in to create a new environment",
          },
        })
      );
      return;
    }
    trackCreateEnvironmentClicked(EnvironmentAnalyticsSource.ENVIRONMENTS_LIST);
    return createNewEnvironment();
  }, [user.loggedIn, dispatch, createNewEnvironment, isValidPermission]);

  const handleExportEnvironments = useCallback(
    (environment: { id: string; name: string }) => {
      const variables = getEnvironmentVariables(environment.id);
      setEnvironmentsToExport([{ ...environment, variables }]);

      setIsExportModalOpen(true);
    },
    [getEnvironmentVariables]
  );

  return (
    <div style={{ height: "inherit" }}>
      {environments?.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            onNewRecordClick={handleAddEnvironmentClick}
            message="No environment created yet"
            newRecordBtnText="Create new environment"
            analyticEventSource={EnvironmentAnalyticsSource.ENVIRONMENTS_LIST}
          />
        </div>
      ) : (
        <>
          <SidebarListHeader onSearch={(value) => setSearchValue(value)} />
          <div className="environments-list">
            {searchValue.length > 0 && filteredEnvironments.length === 0 ? (
              <ListEmptySearchView message="No environments found. Try searching with a different name" />
            ) : (
              <>
                {filteredEnvironments.map((environment) =>
                  isGlobalEnvironment(environment.id) ? (
                    <EnvironmentsListItem openTab={openTab} environment={environment} isReadOnly={!isValidPermission} />
                  ) : (
                    <EnvironmentsListItem
                      openTab={openTab}
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
