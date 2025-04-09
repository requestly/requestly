import React, { useCallback, useEffect, useRef, useState } from "react";
import { Skeleton } from "antd";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { VariablesList } from "../VariablesList/VariablesList";
import { VariablesListHeader } from "../VariablesListHeader/VariablesListHeader";
import { EnvironmentVariables } from "backend/environment/types";
import { toast } from "utils/Toast";
import { useHasUnsavedChanges } from "hooks";
import { isEmpty } from "lodash";
import { isGlobalEnvironment } from "../../utils";
import { ApiClientExportModal } from "features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal";
import { trackVariablesSaved } from "modules/analytics/events/features/apiClient";
import { useGenericState } from "hooks/useGenericState";
import "./environmentView.scss";

interface EnvironmentViewProps {
  envId: string;
}

export const EnvironmentView: React.FC<EnvironmentViewProps> = ({ envId }) => {
  const { isEnvironmentsLoading, getEnvironmentName, getEnvironmentVariables, setVariables } = useEnvironmentManager();

  const pendingVariablesRef = useRef<EnvironmentVariables>(null);

  const [searchValue, setSearchValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const environmentName = getEnvironmentName(envId);
  const variables = pendingVariablesRef.current ?? getEnvironmentVariables(envId);
  const { setPreview, setUnsaved, setTitle } = useGenericState();

  const [pendingVariables, setPendingVariables] = useState<EnvironmentVariables>(variables);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const { hasUnsavedChanges, resetChanges } = useHasUnsavedChanges(pendingVariables);

  useEffect(() => {
    // To sync title for tabs opened from deeplinks
    if (environmentName) {
      setTitle(environmentName);
    }
  }, [environmentName, setTitle]);

  useEffect(() => {
    setUnsaved(hasUnsavedChanges);

    if (hasUnsavedChanges) {
      setPreview(false);
    }
  }, [setUnsaved, setPreview, hasUnsavedChanges]);

  useEffect(() => {
    if (!isSaving) {
      setPendingVariables(variables);
    }
  }, [variables, isSaving]);

  const handleSetPendingVariables = useCallback((variables: EnvironmentVariables) => {
    setPendingVariables(variables);
    pendingVariablesRef.current = variables;
  }, []);

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
              onVariablesChange={handleSetPendingVariables}
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
