import type React from "react";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { RuntimeVariablesList } from "../RuntimeVariablesList/runtimevariableslist";
import { RuntimeVariablesHeader } from "../RuntimeVariablesHeader";
import { useApiClientDispatch, useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { useBufferedRuntimeVariablesEntity, useIsBufferDirty } from "features/apiClient/slices/entities/hooks";
import { toast } from "utils/Toast";
import { isEmpty } from "lodash";
import "./runtimevariableview.scss";
import { DeleteAllRuntimeVariablesModal } from "features/apiClient/screens/apiClient/components/modals/DeleteAllRuntimeVariablesModal/deleteAllRuntimeVariablesModal";
import { useSaveBuffer } from "features/apiClient/slices/buffer/hooks";

export const RuntimeVariablesView: React.FC = () => {
  const globalDispatch = useDispatch();
  const apiClientDispatch = useApiClientDispatch();
  const entity = useBufferedRuntimeVariablesEntity();

  const [searchValue, setSearchValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const variables = entity.variables;
  const variablesData = useApiClientSelector((s) => variables.getAll(s));

  const hasUnsavedChanges = useIsBufferDirty({
    bufferId: entity.meta.id,
    type: "bufferId",
  });

  const {saveOriginExistsBuffer: saveBuffer} = useSaveBuffer();

  const handleSaveVariables = useCallback(async () => {
    saveBuffer(
      {
        entity,
        produceChanges(entity, state) {
            return entity.variables.getAll(state);
        },
        async save() {
        },
      },
      {
        beforeSave() {
          setIsSaving(true);
        },
        afterSave() {
          setIsSaving(false);
        },
        onError(error) {
          console.error("Failed to update variables", error);
          toast.error("Failed to update variables");
        },
        onSuccess(changes, entity) {
          toast.success("Variables updated successfully");
        },
      }
    );
  }, [variablesData, globalDispatch, apiClientDispatch, entity.meta.id]);

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
