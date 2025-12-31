import type React from "react";
import { useCallback, useState } from "react";
import type { RQAPI } from "features/apiClient/types";
import { VariablesListHeader } from "features/apiClient/screens/environment/components/VariablesListHeader/VariablesListHeader";
import { toast } from "utils/Toast";
import { trackVariablesSaved } from "modules/analytics/events/features/apiClient";
import "./collectionsVariablesView.scss";
import { useApiClientDispatch, useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import {
  useBufferedCollectionEntity,
  useBufferByBufferId,
  useIsBufferDirty,
} from "features/apiClient/slices/entities/hooks";
import { bufferActions } from "features/apiClient/slices/buffer/slice";
import { entitySynced } from "features/apiClient/slices/common/actions";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { useApiClientRepository } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry";
import { CollectionsVariablesList } from "../CollectionsVariablesList";
import type { ApiClientRootState } from "features/apiClient/slices/hooks/types";
import { EntityNotFound } from "features/apiClient/slices/types";

interface CollectionsVariablesViewProps {
  collection: RQAPI.CollectionRecord;
}

export const CollectionsVariablesView: React.FC<CollectionsVariablesViewProps> = ({ collection }) => {
  const dispatch = useApiClientDispatch();
  const repositories = useApiClientRepository();

  const [searchValue, setSearchValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Get buffered entity (buffer is already opened by tabs middleware)
  const entity = useBufferedCollectionEntity(collection.id);

  // Get variables from buffered entity
  const variables = entity.variables;
  const variablesData = useApiClientSelector((state: ApiClientRootState) => variables.getAll(state));

  // Track dirty state using dedicated hook
  const hasUnsavedChanges = useIsBufferDirty({
    referenceId: collection.id,
    type: "referenceId",
  });

  // Get buffer entry using dedicated hook
  const bufferEntry = useBufferByBufferId(entity.meta.id);

  // Save handler
  const handleSaveVariables = useCallback(async () => {
    try {
      if (!bufferEntry) throw new EntityNotFound(entity.meta.id, "buffer");

      setIsSaving(true);
      const dataToSave = variablesData;

      // Save to backend via repository
      await repositories.apiClientRecordsRepository.setCollectionVariables(collection.id, dataToSave);

      // Sync to main store - merge updated variables into the full collection object
      dispatch(
        entitySynced({
          entityType: ApiClientEntityType.COLLECTION_RECORD,
          entityId: collection.id,
          data: {
            ...collection,
            data: {
              ...collection.data,
              variables: dataToSave,
            },
          },
        })
      );

      // Mark buffer as saved
      dispatch(
        bufferActions.markSaved({
          id: entity.meta.id,
          referenceId: collection.id,
          savedData: { data: { variables: dataToSave } },
        })
      );

      toast.success("Variables updated successfully");
      trackVariablesSaved({
        type: "collection_variable",
        num_variables: Object.keys(dataToSave).length,
      });
    } catch (error) {
      console.error("Failed to update variables", error);
      toast.error("Failed to update variables");
    } finally {
      setIsSaving(false);
    }
  }, [repositories, collection, dispatch, entity.meta.id, variablesData, bufferEntry]);

  return (
    <div className="collection-variables-view">
      <VariablesListHeader
        hideBreadcrumb
        searchValue={searchValue}
        onSearchValueChange={setSearchValue}
        currentEnvironmentName={collection.name}
        environmentId={collection.id}
        onSave={handleSaveVariables}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
      />
      <CollectionsVariablesList
        variablesData={variablesData}
        variables={variables}
        searchValue={searchValue}
        onSearchValueChange={setSearchValue}
      />
    </div>
  );
};
