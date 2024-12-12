import { useCallback, useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "antd";
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

export const EnvironmentsList = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(getUserAuthDetails);
  const { getAllEnvironments, addNewEnvironment, setCurrentEnvironment } = useEnvironmentManager();
  const [searchValue, setSearchValue] = useState("");
  const [isNewEnvironmentInputVisible, setIsNewEnvironmentInputVisible] = useState(false);
  const [newEnvironmentValue, setNewEnvironmentValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setIsRecordBeingCreated, isRecordBeingCreated } = useApiClientContext();

  const { openTab, replaceTab } = useTabsLayoutContext();

  const environments = useMemo(() => getAllEnvironments(), [getAllEnvironments]);
  const filteredEnvironments = useMemo(
    () => environments.filter((environment) => environment.name?.toLowerCase().includes(searchValue?.toLowerCase())),
    [environments, searchValue]
  );

  const createNewEnvironment = useCallback(
    async (environmentName?: string) => {
      setIsLoading(true);
      setIsRecordBeingCreated(RQAPI.RecordType.ENVIRONMENT);

      const newEnvironment = await addNewEnvironment(environmentName || "New Environment");

      if (newEnvironment) {
        if (environments.length === 0) {
          setCurrentEnvironment(newEnvironment.id);
        }

        const targetPath = `${PATHS.API_CLIENT.ENVIRONMENTS.ABSOLUTE}/${newEnvironment.id}`;
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

      setIsLoading(false);
      setIsNewEnvironmentInputVisible(false);
      setNewEnvironmentValue("");
      setIsRecordBeingCreated(null);
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
    createNewEnvironment();
  }, [user.loggedIn, dispatch, createNewEnvironment]);

  const handleAddNewEnvironment = useCallback(() => {
    createNewEnvironment(newEnvironmentValue);
  }, [createNewEnvironment, newEnvironmentValue]);

  useEffect(() => {
    if (location.pathname.includes(PATHS.API_CLIENT.ENVIRONMENTS.NEW.RELATIVE) && user.loggedIn) {
      setIsNewEnvironmentInputVisible(true);
      setSearchValue("");
    }
  }, [location.pathname, user.loggedIn]);

  return (
    <div style={{ height: "inherit" }}>
      {environments?.length === 0 ? (
        <div className="mt-8">
          {isRecordBeingCreated === RQAPI.RecordType.ENVIRONMENT ? (
            <SidebarPlaceholderItem name="New Environment" />
          ) : (
            <EmptyState
              onNewRecordClick={handleAddEnvironmentClick}
              message="No environment created yet"
              newRecordBtnText="Create new environment"
              analyticEventSource={EnvironmentAnalyticsSource.ENVIRONMENTS_LIST}
            />
          )}
        </div>
      ) : (
        <>
          <SidebarListHeader onSearch={(value) => setSearchValue(value)} />
          {/* TODO: Use input component from collections support PR */}
          {isNewEnvironmentInputVisible && (
            <Input
              autoFocus
              className="environment-input"
              size="small"
              placeholder="New Environment name"
              disabled={isLoading}
              onChange={(e) => setNewEnvironmentValue(e.target.value)}
              onPressEnter={handleAddNewEnvironment}
              onBlur={handleAddNewEnvironment}
            />
          )}
          <div className="environments-list">
            {searchValue.length > 0 && filteredEnvironments.length === 0 ? (
              <ListEmptySearchView message="No environments found. Try searching with a different name" />
            ) : (
              <>
                {filteredEnvironments.map((environment) =>
                  environment.name?.toLowerCase().includes(searchValue?.toLowerCase()) ? (
                    <EnvironmentsListItem openTab={openTab} environment={environment} />
                  ) : null
                )}
                <div className="mt-8">
                  {isRecordBeingCreated === RQAPI.RecordType.ENVIRONMENT && (
                    <SidebarPlaceholderItem name="New Environment" />
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
