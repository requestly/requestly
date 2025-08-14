import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RuntimeVariablesList, RuntimeVariableTableRow } from "../RuntimeVariablesList/runtimevariableslist";
import { RuntimeVariablesHeader } from "../RuntimeVariablesHeader";
import { useRuntimeVariables } from "features/apiClient/hooks/useRuntimeVariables.hook";
import { RuntimeVariableValue } from "features/apiClient/store/runtimeVariables/runtimeVariables.store";
import { useHasUnsavedChanges } from "hooks/useHasUnsavedChanges";
import { useGenericState } from "hooks/useGenericState";
import { mapRuntimeArray } from "features/apiClient/store/runtimeVariables/utils";
import { toast } from "utils/Toast";

export const RuntimeVariablesView: React.FC = () => {
  const [runtimeVariablesMap, resetVariables] = useRuntimeVariables((s) => [s.data, s.reset]);
  const runtimeVariableData = Object.fromEntries(runtimeVariablesMap);

  const pendingVariablesRef = useRef<RuntimeVariableTableRow[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const variables = useMemo(() => {
    return pendingVariablesRef.current.length > 0 ? pendingVariablesRef.current : mapRuntimeArray(runtimeVariableData);
  }, [runtimeVariableData]);

  const [pendingVariables, setPendingVariables] = useState<RuntimeVariableTableRow[]>(variables);
  const { hasUnsavedChanges, resetChanges } = useHasUnsavedChanges(pendingVariables);
  const { setPreview, setUnsaved } = useGenericState();

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

  const handleDeleteAll = useCallback(() => {
    pendingVariablesRef.current = [];
    setPendingVariables([]);
    resetChanges();
    resetVariables();
  }, [resetChanges, resetVariables]);

  const handleSetPendingVariables = useCallback((variables: RuntimeVariableTableRow[]) => {
    setPendingVariables(variables);
    pendingVariablesRef.current = variables;
  }, []);

  const handleUpdate = useCallback(
    (variables: RuntimeVariableTableRow[]) => {
      const newVariablesMap = new Map(
        variables.map((v) => [
          v.key,
          {
            syncValue: v.syncValue,
            isPersisted: v.isPersisted,
            type: v.type,
            id: v.id,
          } as RuntimeVariableValue,
        ])
      );
      resetVariables(newVariablesMap);
    },
    [resetVariables]
  );

  const handleSaveVariables = async () => {
    try {
      setIsSaving(true);
      handleUpdate(pendingVariables);

      toast.success("Variables updated successfully");

      resetChanges();
    } catch (error) {
      console.error("Failed to update variables", error);
      toast.error("Failed to update variables");
    } finally {
      setIsSaving(false);
    }
  };
  const [searchValue, setSearchValue] = useState<string>("");
  return (
    <div className="runtime-variables-view-container">
      <div className="runtime-variables-list-view">
        <RuntimeVariablesHeader
          searchValue={searchValue}
          onSearchValueChange={setSearchValue}
          onSave={handleSaveVariables}
          onDeleteAll={handleDeleteAll}
        />

        <RuntimeVariablesList
          searchValue={searchValue}
          variables={variables}
          onVariablesChange={handleSetPendingVariables}
        />
      </div>
    </div>
  );
};
