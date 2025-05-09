import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "antd";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { EnvironmentVariableTableRow, VariablesList } from "../VariablesList/VariablesList";
import { VariablesListHeader } from "../VariablesListHeader/VariablesListHeader";
import { toast } from "utils/Toast";
import { useHasUnsavedChanges } from "hooks";
import { isEmpty } from "lodash";
import { convertEnvironmentToMap, isGlobalEnvironment, mapToEnvironmentArray } from "../../utils";
import { ApiClientExportModal } from "features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal";
import { trackVariablesSaved } from "modules/analytics/events/features/apiClient";
import { useGenericState } from "hooks/useGenericState";
import "./environmentView.scss";

interface EnvironmentViewProps {
  envId: string;
}

export const EnvironmentView: React.FC<EnvironmentViewProps> = ({ envId }) => {
  const { isEnvironmentsLoading, getEnvironmentName, getEnvironmentVariables, setVariables } = useEnvironmentManager();

  const pendingVariablesRef = useRef<EnvironmentVariableTableRow[]>([]);

  const [searchValue, setSearchValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const environmentName = getEnvironmentName(envId);
  const variables = useMemo(() => {
    return pendingVariablesRef.current.length > 0
      ? pendingVariablesRef.current
      : mapToEnvironmentArray(getEnvironmentVariables(envId));
  }, [getEnvironmentVariables, envId]);

  const [pendingVariables, setPendingVariables] = useState<EnvironmentVariableTableRow[]>(variables);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const { hasUnsavedChanges, resetChanges } = useHasUnsavedChanges(pendingVariables);

  const { setPreview, setUnsaved, setTitle } = useGenericState();

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

  const handleSetPendingVariables = useCallback((variables: EnvironmentVariableTableRow[]) => {
    setPendingVariables(variables);
    pendingVariablesRef.current = variables;
  }, []);

  const handleSaveVariables = async () => {
    setIsSaving(true);
    const variablesToSave = convertEnvironmentToMap(pendingVariables);
    return setVariables(envId, variablesToSave)
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
                environments={[{ id: envId, name: environmentName, variables: convertEnvironmentToMap(variables) }]}
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
