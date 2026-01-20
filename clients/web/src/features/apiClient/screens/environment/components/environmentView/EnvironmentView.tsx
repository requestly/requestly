import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { VariableRow, VariablesList } from "../VariablesList/VariablesList";
import { VariablesListHeader } from "../VariablesListHeader/VariablesListHeader";
import { toast } from "utils/Toast";
import { useHasUnsavedChanges } from "hooks";
import { isEmpty } from "lodash";
import { convertEnvironmentToMap, isGlobalEnvironment, mapToEnvironmentArray } from "../../utils";
import { ApiClientExportModal } from "features/apiClient/screens/apiClient/components/modals/exportModal/ApiClientExportModal";
import { PostmanEnvironmentExportModal } from "features/apiClient/screens/apiClient/components/modals/postmanEnvironmentExportModal/PostmanEnvironmentExportModal";
import { trackVariablesSaved } from "modules/analytics/events/features/apiClient";
import { useGenericState } from "hooks/useGenericState";
import { useCommand } from "features/apiClient/commands";
import { useEnvironment } from "features/apiClient/hooks/useEnvironment.hook";
import "./environmentView.scss";
import { useVariableStore } from "features/apiClient/hooks/useVariable.hook";
import { EnvironmentVariablesList } from "../VariablesList/EnvironmentVariablesList";
import { VariableRow } from "../VariablesList/VariablesList";

interface EnvironmentViewProps {
  envId: string;
}

export const EnvironmentView: React.FC<EnvironmentViewProps> = ({ envId }) => {
  const environment = useEnvironment(envId, (s) => s);
  const variablesMap = useVariableStore(environment.data.variables);
  const variablesData = useMemo(() => {
    return mapToEnvironmentArray(Object.fromEntries(variablesMap.data));
  }, [variablesMap]);
  const {
    env: { setEnvironmentVariables },
  } = useCommand();

  const pendingVariablesRef = useRef<VariableRow[]>([]);

  const [searchValue, setSearchValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const environmentName = environment.name;

  // FIXME: Saves last input value even when cleared
  const variables = useMemo(() => {
    return pendingVariablesRef.current.length > 0 ? pendingVariablesRef.current : variablesData;
  }, [variablesData]);

  const [pendingVariables, setPendingVariables] = useState<VariableRow[]>(variables);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPostmanExportModalOpen, setIsPostmanExportModalOpen] = useState(false);

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

  const handleSetPendingVariables = useCallback((variables: VariableRow[]) => {
    setPendingVariables(variables);
    pendingVariablesRef.current = variables;
  }, []);

  const handleSaveVariables = async () => {
    try {
      setIsSaving(true);

      const variablesToSave = convertEnvironmentToMap(pendingVariables);
      await setEnvironmentVariables({ environmentId: envId, variables: variablesToSave });

      toast.success("Variables updated successfully");
      trackVariablesSaved({
        type: isGlobalEnvironment(envId) ? "global_variables" : "environment_variable",
        num_variables: pendingVariables.length,
      });

      resetChanges();
    } catch (error) {
      console.error("Failed to update variables", error);
      toast.error("Failed to update variables");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div key={envId} className="variables-list-view-container">
      <div className="variables-list-view">
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
            onRequestlyExportClick: () => setIsExportModalOpen(true),
            onPostmanExportClick: () => setIsPostmanExportModalOpen(true),
          }}
        />
        <EnvironmentVariablesList
          searchValue={searchValue}
          pendingVariables={pendingVariables}
          handleSetPendingVariables={handleSetPendingVariables}
          onSearchValueChange={setSearchValue}
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
        {isPostmanExportModalOpen && (
          <PostmanEnvironmentExportModal
            environments={[{ id: envId, name: environmentName, variables: convertEnvironmentToMap(variables) }]}
            isOpen={isPostmanExportModalOpen}
            onClose={() => {
              setIsPostmanExportModalOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
};
