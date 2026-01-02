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
  useIsBufferDirty,
} from "features/apiClient/slices/entities/hooks";
import { bufferActions } from "features/apiClient/slices/buffer/slice";
import { entitySynced } from "features/apiClient/slices/common/actions";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { useApiClientRepository } from "features/apiClient/slices/workspaceView/helpers/ApiClientContextRegistry";
import { CollectionsVariablesList } from "../CollectionsVariablesList";
import type { ApiClientRootState } from "features/apiClient/slices/hooks/types";
import { BufferedApiClientEntity } from "features/apiClient/slices/entities/buffered/factory";
import { ApiClientEntity, BufferedHttpRecordEntity } from "features/apiClient/slices/entities";
import { useSaveBuffer } from "features/apiClient/slices/buffer/hooks";

interface CollectionsVariablesViewProps {
  collectionId: string;
}

export const CollectionsVariablesView: React.FC<CollectionsVariablesViewProps> = ({ collectionId }) => {
  const dispatch = useApiClientDispatch();
  const repositories = useApiClientRepository();

  const [searchValue, setSearchValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Get buffered entity (buffer is already opened by tabs middleware)
  const entity = useBufferedCollectionEntity(collectionId);
  const name = useApiClientSelector(s => entity.getName(s));

  // Get variables from buffered entity
  const variables = entity.variables;
  const variablesData = useApiClientSelector((state: ApiClientRootState) => variables.getAll(state));

  // Track dirty state using dedicated hook
  const hasUnsavedChanges = useIsBufferDirty({
    referenceId: collectionId,
    type: "referenceId",
  });

  const saveBuffer = useSaveBuffer();

  // Save handler
  const handleSaveVariables = useCallback(async () => {
    saveBuffer({
      entity,
      produceChanges(entity, state) {
        return entity.variables.getAll(state)
      },
      async save(changes, repositories) {
        await repositories.apiClientRecordsRepository.setCollectionVariables(collectionId, changes);
      },
    }, {
      onError(error) {
        console.error("Failed to update variables", error);
        toast.error("Failed to update variables");

      },
      onSuccess(changes, entity) {
        entity.origin.variables.refresh(changes);
        toast.success("Variables updated successfully");
        trackVariablesSaved({
          type: "collection_variable",
          num_variables: Object.keys(changes).length,
        });

      },
      beforeSave() {
        setIsSaving(true);
      },
      afterSave() {
        setIsSaving(false);
      },
    });
  }, [repositories, collectionId, dispatch, entity.meta.id, variablesData]);

  return (
    <div className="collection-variables-view">
      <VariablesListHeader
        hideBreadcrumb
        searchValue={searchValue}
        onSearchValueChange={setSearchValue}
        currentEnvironmentName={name}
        environmentId={collectionId}
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
