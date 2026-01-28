import { useSaveBuffer } from 'features/apiClient/slices/buffer/hooks';
import { useIsBufferDirty } from 'features/apiClient/slices/entities';
import { useBufferedRuntimeVariablesEntity } from 'features/apiClient/slices/entities/hooks';
import { useApiClientSelector } from 'features/apiClient/slices/hooks/base.hooks';
import { rqNotify } from 'features/apiClientV2/common/notification';
import { useCallback, useState } from 'react';

export default function useRuntimeVariablesHeader() {
  const entity = useBufferedRuntimeVariablesEntity();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const variables = entity.variables;
  const variablesData = useApiClientSelector((s) => variables.getAll(s));

  const hasUnsavedChanges = useIsBufferDirty({
    bufferId: entity.meta.id,
    type: 'bufferId'
  });

  const saveBuffer = useSaveBuffer();

  const handleSaveVariables = useCallback(async () => {
    saveBuffer(
      {
        entity,
        async save() {}
      },
      {
        beforeSave() {
          setIsSaving(true);
        },
        afterSave() {
          setIsSaving(false);
        },
        onError(error) {
          console.error('Failed to update variables', error);
          rqNotify({
            type: 'error',
            title: 'Failed to update variables',
            description: error?.message || 'An unexpected error occurred'
          });
        },
        onSuccess(changes, entity) {
          rqNotify({
            type: 'success',
            title: 'Variables updated successfully'
          });
        }
      }
    );
  }, [saveBuffer, entity]);

  const handleDeleteAll = useCallback(() => {
    try {
      variables.clearAll();

      setIsDeleteModalOpen(false);
    } catch {
      rqNotify({
        type: 'error',
        title: 'Error while deleting all variables'
      });
    }
  }, [variables]);

  const onDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
  }, []);

  return {
    isSaving,
    setIsSaving,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    variablesData,
    hasUnsavedChanges,
    handleSaveVariables,
    handleDeleteAll,
    onDeleteModalClose
  };
}
