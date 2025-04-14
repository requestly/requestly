import { useCallback, useState, useMemo } from "react";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useDispatch, useSelector } from "react-redux";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { SidebarListHeader } from "../../../apiClient/components/sidebar/components/sidebarListHeader/SidebarListHeader";
import { trackCreateEnvironmentClicked, trackEnvironmentCreated } from "../../analytics";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";
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
import { ErrorFilesList } from "features/apiClient/screens/apiClient/components/sidebar/components/ErrorFilesList/ErrorFileslist";
import { toast } from "utils/Toast";
import { RBAC, useRBAC } from "features/rbac";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { EnvironmentViewTabSource } from "../environmentView/EnvironmentViewTabSource";
import "./environmentsList.scss";

export const EnvironmentsList = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const { getAllEnvironments, addNewEnvironment, setCurrentEnvironment, getEnvironmentVariables, errorEnvFiles } =
    useEnvironmentManager();
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

            // const targetPath = `${PATHS.API_CLIENT.ENVIRONMENTS.ABSOLUTE}/${encodeURIComponent(newEnvironment.id)}`;

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
  }, [user.loggedIn, dispatch, createNewEnvironment, isValidPermission, getRBACValidationFailureErrorMessage]);

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
            {errorEnvFiles.length > 0 && <ErrorFilesList errorFiles={errorEnvFiles} />}
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
