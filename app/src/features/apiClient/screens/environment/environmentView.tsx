import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "antd";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { VariablesList } from "./components/VariablesList/VariablesList";
import { VariablesListHeader } from "./components/VariablesListHeader/VariablesListHeader";
import { EnvironmentsSidebar } from "./components/environmentsSidebar/EnvironmentsSidebar";
import PATHS from "config/constants/sub/paths";
import "./environmentView.scss";
import { getUserAuthDetails } from "store/selectors";
import { useSelector } from "react-redux";

export const EnvironmentView = () => {
  const navigate = useNavigate();
  const { isEnvironmentsLoading, getEnvironmentName, getAllEnvironments } = useEnvironmentManager();
  const user = useSelector(getUserAuthDetails);
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

  // useEffect(() => {
  //   if (!isEnvironmentsLoading) {
  //     const environments = getAllEnvironments();
  //     if (environments?.length === 0 || !user.loggedIn) {
  //       navigate(PATHS.API_CLIENT.ENVIRONMENTS.ABSOLUTE);
  //     }
  //   }
  // }, [getAllEnvironments, navigate, isEnvironmentsLoading, user.loggedIn]);

  if (isLoading) {
    return <Skeleton active />;
  }

  return (
    <div className="variables-list-view-container">
      <EnvironmentsSidebar />
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
