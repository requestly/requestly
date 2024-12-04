import { useCallback, useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "antd";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { SidebarListHeader } from "../../../apiClient/components/sidebar/components/sidebarListHeader/SidebarListHeader";
import { redirectToNewEnvironment } from "utils/RedirectionUtils";
import PATHS from "config/constants/sub/paths";
import { trackCreateEnvironmentClicked, trackEnvironmentCreated } from "../../analytics";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import { EmptyState } from "features/apiClient/screens/apiClient/components/sidebar/components/emptyState/EmptyState";
import { ListEmptySearchView } from "features/apiClient/screens/apiClient/components/sidebar/components/listEmptySearchView/ListEmptySearchView";
import { EnvironmentAnalyticsSource } from "../../types";
import { EnvironmentsListItem } from "./components/environmentsListItem/EnvironmentsListItem";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import "./environmentsList.scss";

export const EnvironmentsList = () => {
  const { envId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(getUserAuthDetails);
  const { getAllEnvironments, addNewEnvironment, setCurrentEnvironment } = useEnvironmentManager();
  const [searchValue, setSearchValue] = useState("");
  const [isNewEnvironmentInputVisible, setIsNewEnvironmentInputVisible] = useState(false);
  const [newEnvironmentValue, setNewEnvironmentValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { openTab, replaceTab } = useTabsLayoutContext();

  const environments = useMemo(() => getAllEnvironments(), [getAllEnvironments]);
  const filteredEnvironments = useMemo(
    () => environments.filter((environment) => environment.name.toLowerCase().includes(searchValue.toLowerCase())),
    [environments, searchValue]
  );

  const handleAddEnvironmentClick = useCallback(() => {
    if (!user.loggedIn) {
      dispatch(
        actions.toggleActiveModal({
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
    redirectToNewEnvironment(navigate);
  }, [user.loggedIn, dispatch, navigate]);

  const handleAddNewEnvironment = useCallback(async () => {
    if (newEnvironmentValue) {
      setIsLoading(true);
      const newEnvironment = await addNewEnvironment(newEnvironmentValue);
      if (newEnvironment) {
        if (environments.length === 0) {
          // if there are no environments, set the new environment as the active environment
          setCurrentEnvironment(newEnvironment.id);
        }

        if (envId === "new") {
          replaceTab("environments/new", {
            id: newEnvironment.id,
            title: newEnvironment.name,
            url: `${PATHS.API_CLIENT.ENVIRONMENTS.ABSOLUTE}/${newEnvironment.id}`,
          });
        }

        trackEnvironmentCreated(environments.length, EnvironmentAnalyticsSource.ENVIRONMENTS_LIST);
      }
      setIsLoading(false);
    } else {
      navigate(-1);
    }
    setIsNewEnvironmentInputVisible(false);
    setNewEnvironmentValue("");
  }, [addNewEnvironment, navigate, environments.length, newEnvironmentValue, setCurrentEnvironment, replaceTab, envId]);

  useEffect(() => {
    if (location.pathname.includes(PATHS.API_CLIENT.ENVIRONMENTS.NEW.RELATIVE) && user.loggedIn) {
      setIsNewEnvironmentInputVisible(true);
      setSearchValue("");
    }
  }, [location.pathname, user.loggedIn]);

  return (
    <div style={{ height: "inherit" }}>
      {environments?.length === 0 ? (
        isNewEnvironmentInputVisible ? (
          <div className="mt-8">
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
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              onNewRecordClick={() => redirectToNewEnvironment(navigate)}
              message="No environment created yet"
              newRecordBtnText="Create new environment"
              analyticEventSource={EnvironmentAnalyticsSource.ENVIRONMENTS_LIST}
            />
          </div>
        )
      ) : (
        <>
          <SidebarListHeader onAddRecordClick={handleAddEnvironmentClick} onSearch={(value) => setSearchValue(value)} />
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
                  environment.name.toLowerCase().includes(searchValue.toLowerCase()) ? (
                    <EnvironmentsListItem openTab={openTab} environment={environment} />
                  ) : null
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
