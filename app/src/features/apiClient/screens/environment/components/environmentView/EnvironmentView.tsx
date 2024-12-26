import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "antd";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { VariablesList } from "../VariablesList/VariablesList";
import { VariablesListHeader } from "../VariablesListHeader/VariablesListHeader";
import PATHS from "config/constants/sub/paths";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useSelector } from "react-redux";
import { EnvironmentVariables } from "backend/environment/types";
import { toast } from "utils/Toast";
import { useHasUnsavedChanges } from "hooks";
import "./environmentView.scss";
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
  } = useEnvironmentManager();
  const { updateTab } = useTabsLayoutContext();
  const user = useSelector(getUserAuthDetails);
  const [searchValue, setSearchValue] = useState<string>("");
  const { envId } = useParams();
  const environmentName = getEnvironmentName(envId);
  const variables = getEnvironmentVariables(envId);

  const [pendingVariables, setPendingVariables] = useState<EnvironmentVariables>(variables);

  const { hasUnsavedChanges, resetChanges } = useHasUnsavedChanges(pendingVariables);

  useEffect(() => {
    updateTab(envId, { hasUnsavedChanges: hasUnsavedChanges });
  }, [updateTab, envId, hasUnsavedChanges]);

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

  const handleSaveVariables = async () => {
    return setVariables(envId, pendingVariables)
      .then(() => {
        toast.success("Variables updated successfully");
        resetChanges();
      })
      .catch((error) => {
        toast.error("Failed to update variables");
        console.error("Failed to updated variables: ", error);
      });
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
              onSave={handleSaveVariables}
              hasUnsavedChanges={hasUnsavedChanges}
            />
            <VariablesList searchValue={searchValue} variables={variables} onVariablesChange={setPendingVariables} />
          </>
        )}
      </div>
    </div>
  );
};
