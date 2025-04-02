import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { useTabsLayoutContext } from "layouts/TabsLayout";
import { isEmpty } from "lodash";
import { isGlobalEnvironment } from "../../utils";
import { ApiClientExportModal } from "features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal";
import { trackVariablesSaved } from "modules/analytics/events/features/apiClient";
import "./environmentView.scss";

interface EnvironmentViewProps {
  envId: string;
}

export const EnvironmentView: React.FC<EnvironmentViewProps> = ({ envId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isEnvironmentsLoading,
    getEnvironmentName,
    getAllEnvironments,
    getEnvironmentVariables,
    setVariables,
  } = useEnvironmentManager();
  const { updateTab, tabs } = useTabsLayoutContext();

  const user = useSelector(getUserAuthDetails);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const environmentName = getEnvironmentName(envId);
  const variables = getEnvironmentVariables(envId);

  const [pendingVariables, setPendingVariables] = useState<EnvironmentVariables>(variables);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const { hasUnsavedChanges, resetChanges } = useHasUnsavedChanges(pendingVariables);

  useEffect(() => {
    updateTab(envId, { hasUnsavedChanges: hasUnsavedChanges });
  }, [updateTab, envId, hasUnsavedChanges]);

  useEffect(() => {
    if (!isSaving) {
      setPendingVariables(variables);
    }
  }, [variables, isSaving]);

  useEffect(() => {
    if (!isEnvironmentsLoading) {
      if (!user.loggedIn) {
        navigate(PATHS.API_CLIENT.ABSOLUTE);
        return;
      }

      const environments = getAllEnvironments();
      const hasAccessToEnvironment = environments?.some((env) => env.id === envId);
      if (environments?.length === 0 || !hasAccessToEnvironment) {
        if (!tabs.length) {
          navigate(PATHS.API_CLIENT.ABSOLUTE);
          return;
        }
      }
    }
  }, [getAllEnvironments, navigate, isEnvironmentsLoading, user.loggedIn, envId, location.pathname, tabs.length]);

  const handleSaveVariables = async () => {
    setIsSaving(true);
    return setVariables(envId, pendingVariables)
      .then(() => {
        toast.success("Variables updated successfully");
        trackVariablesSaved({
          type: isGlobalEnvironment(envId) ? "global_variables" : "environment_variable",
          num_variables: pendingVariables.length,
        });
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
    <div key={envId} className="variables-list-view-container">
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
              isSaving={isSaving}
              exportActions={{
                showExport: isGlobalEnvironment(envId),
                enableExport: !isEmpty(variables),
                onExportClick: () => setIsExportModalOpen(true),
              }}
            />
            <VariablesList
              searchValue={searchValue}
              variables={pendingVariables}
              onVariablesChange={setPendingVariables}
            />
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
