import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { RuntimeVariablesList } from "../RuntimeVariablesList/runtimevariableslist";
import { RuntimeVariablesHeader } from "../RuntimeVariablesHeader";
import { useApiClientDispatch, useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { useBufferedRuntimeVariablesEntity } from "features/apiClient/slices/entities/hooks";
import { bufferActions, bufferAdapterSelectors } from "features/apiClient/slices/buffer/slice";
import { runtimeVariablesActions } from "features/apiClient/slices/runtimeVariables/slice";
import { toast } from "utils/Toast";
import { isEmpty } from "lodash";
import "./runtimevariableview.scss";
import { DeleteAllRuntimeVariablesModal } from "features/apiClient/screens/apiClient/components/modals/DeleteAllRuntimeVariablesModal/deleteAllRuntimeVariablesModal";
import { RUNTIME_VARIABLES_ENTITY_ID } from "features/apiClient/slices/common/constants";

export const RuntimeVariablesView: React.FC = () => {
  const globalDispatch = useDispatch();
  const apiClientDispatch = useApiClientDispatch();
  const entity = useBufferedRuntimeVariablesEntity();
  const state = useApiClientSelector((s) => s);

  const [searchValue, setSearchValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const variables = entity.variables;
  const variablesData = useMemo(() => variables.getAll(state), [variables, state]);

  const bufferEntry = useApiClientSelector((s) => bufferAdapterSelectors.selectById(s.buffer, entity.meta.id));
  const hasUnsavedChanges = useMemo(() => bufferEntry?.isDirty ?? false, [bufferEntry]);

  const handleSaveVariables = useCallback(async () => {
    try {
      setIsSaving(true);
      const dataToSave = variables.getAll(state);

      globalDispatch(
        runtimeVariablesActions.unsafePatch({
          patcher: (entity) => {
            entity.variables = dataToSave;
          },
        })
      );

      apiClientDispatch(
        bufferActions.markSaved({
          id: entity.meta.id,
          referenceId: RUNTIME_VARIABLES_ENTITY_ID,
          savedData: { variables: dataToSave },
        })
      );
      toast.success("Variables updated successfully");
    } catch (error) {
      console.error("Failed to update variables", error);
      toast.error("Failed to update variables");
    } finally {
      setIsSaving(false);
    }
  }, [variables, state, globalDispatch, apiClientDispatch, entity.meta.id]);

  const handleDeleteAll = useCallback(() => {
    try {
      variables.clearAll();

      setIsDeleteModalOpen(false);
    } catch {
      toast.error("Error while deleting all variables");
    }
  }, [variables]);

  const onDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  return (
    <div className="runtime-variables-view-container">
      <div className="runtime-variables-list-view">
        <RuntimeVariablesHeader
          searchValue={searchValue}
          hasVariables={!isEmpty(variablesData)}
          onSearchValueChange={setSearchValue}
          onSave={handleSaveVariables}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          onDeleteAll={() => {
            setIsDeleteModalOpen(true);
          }}
        />
        {isDeleteModalOpen && (
          <DeleteAllRuntimeVariablesModal
            open={isDeleteModalOpen}
            onClose={onDeleteModalClose}
            onClickDelete={handleDeleteAll}
          />
        )}
        <RuntimeVariablesList
          variablesData={variablesData}
          variables={variables}
          searchValue={searchValue}
          onSearchValueChange={setSearchValue}
        />
      </div>
    </div>
  );
};
