import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { isEmpty } from "lodash";
import { isGlobalEnvironment } from "../../utils";
import { ApiClientExportModal } from "features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal";

export const EnvironmentView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const {
    isEnvironmentsLoading,
    getEnvironmentName,
    getAllEnvironments,
    getEnvironmentVariables,
    setVariables,
  } = useEnvironmentManager();
  const { updateTab, tabs } = useTabsLayoutContext();
  const { envId } = useParams();
  const [persistedEnvId, setPersistedEnvId] = useState<string>(envId);

  const user = useSelector(getUserAuthDetails);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const environmentName = getEnvironmentName(persistedEnvId);
  const variables = getEnvironmentVariables(persistedEnvId);
  const isNewEnv = searchParams.has("new");

  useEffect(() => {
    if (isNewEnv) {
      setPersistedEnvId(envId);
    }
  }, [isNewEnv, envId]);

  const [pendingVariables, setPendingVariables] = useState<EnvironmentVariables>(variables);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

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
  }, [
    getAllEnvironments,
    navigate,
    isEnvironmentsLoading,
    user.loggedIn,
    persistedEnvId,
    location.pathname,
    tabs.length,
  ]);

  const handleSaveVariables = async () => {
    setIsSaving(true);
    return setVariables(persistedEnvId, pendingVariables)
      .then(() => {
        toast.success("Variables updated successfully");
        resetChanges();
      })
      .catch((error) => {
        toast.error("Failed to update variables");
        console.error("Failed to updated variables: ", error);
      })
      .finally(() => {
        setIsSaving(false);
      });
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
              onSave={handleSaveVariables}
              hasUnsavedChanges={hasUnsavedChanges}
              isSaving={isSaving}
              exportActions={{
                showExport: isGlobalEnvironment(envId),
                enableExport: !isEmpty(variables),
                onExportClick: () => setIsExportModalOpen(true),
              }}
            />
            <VariablesList searchValue={searchValue} variables={variables} onVariablesChange={setPendingVariables} />
            {isExportModalOpen && (
              <ApiClientExportModal
                exportType="environment"
                environments={[{ id: envId, name: environmentName, variables }]}
                isOpen={isExportModalOpen}
                onClose={() => {
                  setIsExportModalOpen(false);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
