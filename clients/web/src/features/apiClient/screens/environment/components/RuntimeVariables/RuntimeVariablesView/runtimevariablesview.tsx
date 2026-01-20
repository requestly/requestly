import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RuntimeVariablesList } from "../RuntimeVariablesList/runtimevariableslist";
import { RuntimeVariablesHeader } from "../RuntimeVariablesHeader";
import { useRuntimeVariables } from "features/apiClient/hooks/useRuntimeVariables.hook";
import { RuntimeVariableValue } from "features/apiClient/store/runtimeVariables/runtimeVariables.store";
import { useHasUnsavedChanges } from "hooks/useHasUnsavedChanges";
import { useGenericState } from "hooks/useGenericState";
import { mapRuntimeArray } from "features/apiClient/store/runtimeVariables/utils";
import { toast } from "utils/Toast";
import "./runtimevariableview.scss";
import { DeleteAllRuntimeVariablesModal } from "features/apiClient/screens/apiClient/components/modals/DeleteAllRuntimeVariablesModal/deleteAllRuntimeVariablesModal";
import { VariableRow } from "../../VariablesList/VariablesList";

export const RuntimeVariablesView: React.FC = () => {
  const [runtimeVariablesMap, resetVariables] = useRuntimeVariables((s) => [s.data, s.reset]);
  const runtimeVariableData = useMemo(() => Object.fromEntries(runtimeVariablesMap), [runtimeVariablesMap]);

  const pendingVariablesRef = useRef<VariableRow[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const variables = useMemo(() => {
    return pendingVariablesRef.current.length > 0 ? pendingVariablesRef.current : mapRuntimeArray(runtimeVariableData);
  }, [runtimeVariableData]);

  const [pendingVariables, setPendingVariables] = useState<VariableRow[]>(variables);
  const { hasUnsavedChanges, resetChanges } = useHasUnsavedChanges(pendingVariables);
  const { setPreview, setUnsaved } = useGenericState();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const onDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  const handleDeleteAll = useCallback(() => {
    try {
      pendingVariablesRef.current = [];
      setPendingVariables([]);
      resetVariables();
      resetChanges();
    } catch {
      toast.error("Error while deleting all variables");
    }

    setIsDeleteModalOpen(false);
  }, [resetChanges, resetVariables]);

  const handleSetPendingVariables = useCallback((variables: VariableRow[]) => {
    setPendingVariables(variables);
    pendingVariablesRef.current = variables;
  }, []);

  const handleUpdate = useCallback(
    (variables: VariableRow[]) => {
      const newVariablesMap = new Map(
        variables.map((v) => [
          v.key,
          {
            localValue: v.localValue,
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
          variables={variables}
          onSearchValueChange={setSearchValue}
          onSave={handleSaveVariables}
          onDeleteAll={() => {
            setIsDeleteModalOpen(true);
          }}
        />
        {isDeleteModalOpen ? (
          <DeleteAllRuntimeVariablesModal
            open={isDeleteModalOpen}
            onClose={onDeleteModalClose}
            onClickDelete={handleDeleteAll}
          />
        ) : null}
        <RuntimeVariablesList
          searchValue={searchValue}
          variables={variables}
          onVariablesChange={handleSetPendingVariables}
          onSearchValueChange={setSearchValue}
        />
      </div>
    </div>
  );
};
