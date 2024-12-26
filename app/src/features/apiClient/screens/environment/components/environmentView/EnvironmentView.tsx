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
  const user = useSelector(getUserAuthDetails);
  const [searchValue, setSearchValue] = useState<string>("");
  const { envId } = useParams();
  const environmentName = getEnvironmentName(envId);
  const variables = getEnvironmentVariables(envId);

  useEffect(() => {
    if (!isEnvironmentsLoading) {
      if (location.pathname.includes(PATHS.API_CLIENT.ENVIRONMENTS.NEW.RELATIVE)) {
        return;
      }
      if (!user.loggedIn) {
        navigate(PATHS.API_CLIENT.ENVIRONMENTS.ABSOLUTE);
        return;
      }

      const environments = getAllEnvironments();
      const hasAccessToEnvironment = environments?.some((env) => env.id === envId);
      if (environments?.length === 0 || !hasAccessToEnvironment) {
        navigate(PATHS.API_CLIENT.ENVIRONMENTS.ABSOLUTE);
      }
    }
  }, [getAllEnvironments, navigate, isEnvironmentsLoading, user.loggedIn, envId, location.pathname]);

  const handleSetVariables = async (variables: EnvironmentVariables) => {
    return setVariables(envId, variables);
  };

  const handleRemoveVariable = async (key: string) => {
    return removeVariable(envId, key);
  };

  return (
    <div className="variables-list-view-container">
      <div className="variables-list-view">
        {isEnvironmentsLoading ? (
          <Skeleton active />
        ) : (
          <>
            <VariablesListHeader
              searchValue={searchValue}
              onSearchValueChange={setSearchValue}
              currentEnvironmentName={environmentName}
              environmentId={envId}
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
