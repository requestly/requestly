import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { useParams, useNavigate } from "react-router-dom";
import { Skeleton } from "antd";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import APIClientSidebar from "../apiClient/components/sidebar/APIClientSidebar";
import { VariablesList } from "./components/VariablesList/VariablesList";
import { VariablesListHeader } from "./components/VariablesListHeader/VariablesListHeader";
import "./environmentView.scss";
import { actions } from "store";
import APP_CONSTANTS from "config/constants";
import { redirectToNewEnvironment } from "utils/RedirectionUtils";

export const EnvironmentView = () => {
  const user = useSelector(getUserAuthDetails);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isEnvironmentsLoading, getEnvironmentName } = useEnvironmentManager();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const { envId } = useParams();
  const environmentName = getEnvironmentName(envId);

  useEffect(() => {
    if (isEnvironmentsLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [isEnvironmentsLoading]);

  if (isLoading) {
    return <Skeleton active />;
  }

  const handleNewEnvironmentClick = () => {
    if (!user.loggedIn) {
      dispatch(
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            eventSource: "api_client_sidebar",
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
            warningMessage: "Please log in to create a new environment",
          },
        })
      );
    } else {
      redirectToNewEnvironment(navigate);
    }
  };

  return (
    <div className="variables-list-view-container">
      <APIClientSidebar onNewClick={handleNewEnvironmentClick} />
      <div className="variables-list-view">
        <VariablesListHeader
          searchValue={searchValue}
          onSearchValueChange={setSearchValue}
          currentEnvironmentName={environmentName}
        />
        <VariablesList searchValue={searchValue} currentEnvironmentId={envId} />
      </div>
    </div>
  );
};
