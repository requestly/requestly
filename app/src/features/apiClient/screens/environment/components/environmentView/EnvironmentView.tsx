import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "antd";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { VariablesList } from "../VariablesList/VariablesList";
import { VariablesListHeader } from "../VariablesListHeader/VariablesListHeader";
import PATHS from "config/constants/sub/paths";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useSelector } from "react-redux";
import "./environmentView.scss";
import { EnvironmentVariables } from "backend/environment/types";
import { useTabsLayoutContext } from "layouts/TabsLayout";

export const EnvironmentView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isEnvironmentsLoading,
    getEnvironmentName,
    getAllEnvironments,
    getEnvironmentVariables,
    setVariables,
    removeVariable,
  } = useEnvironmentManager();
  const { envId } = useParams();
  const [persistedEnvId] = useState<string>(envId);

  const user = useSelector(getUserAuthDetails);
  const [searchValue, setSearchValue] = useState<string>("");
  const environmentName = getEnvironmentName(persistedEnvId);
  const variables = getEnvironmentVariables(persistedEnvId);

  const { tabs } = useTabsLayoutContext();

  useEffect(() => {
    if (!isEnvironmentsLoading) {
      if (location.pathname.includes(PATHS.API_CLIENT.ENVIRONMENTS.NEW.RELATIVE)) {
        return;
      }
      if (!user.loggedIn) {
        navigate(PATHS.API_CLIENT.ABSOLUTE);
        return;
      }

      const environments = getAllEnvironments();
      const hasAccessToEnvironment = environments?.some((env) => env.id === persistedEnvId);
      if (environments?.length === 0 || !hasAccessToEnvironment) {
        if (!tabs.length) {
          navigate(PATHS.API_CLIENT.ABSOLUTE);
          return;
        }
      }
    }
  }, [getAllEnvironments, navigate, isEnvironmentsLoading, user.loggedIn, persistedEnvId, location.pathname, tabs]);

  const handleSetVariables = async (variables: EnvironmentVariables) => {
    return setVariables(persistedEnvId, variables);
  };

  const handleRemoveVariable = async (key: string) => {
    return removeVariable(persistedEnvId, key);
  };

  return (
    <div key={persistedEnvId} className="variables-list-view-container">
      <div className="variables-list-view">
        {isEnvironmentsLoading ? (
          <Skeleton active />
        ) : (
          <>
            <VariablesListHeader
              searchValue={searchValue}
              onSearchValueChange={setSearchValue}
              currentEnvironmentName={environmentName}
              environmentId={persistedEnvId}
            />
            <VariablesList
              searchValue={searchValue}
              variables={variables}
              setVariables={handleSetVariables}
              removeVariable={handleRemoveVariable}
            />
          </>
        )}
      </div>
    </div>
  );
};
