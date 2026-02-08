import { notification } from "antd";
import { VariablesListHeader } from "features/apiClient/screens/environment/components/VariablesListHeader/VariablesListHeader";
import { useSaveBuffer } from "features/apiClient/slices/buffer/hooks";
import { useBufferedCollectionEntity, useIsBufferDirty } from "features/apiClient/slices/entities/hooks";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import type { ApiClientRootState } from "features/apiClient/slices/hooks/types";
import { trackVariablesSaved } from "modules/analytics/events/features/apiClient";
import type React from "react";
import { useCallback, useState } from "react";
import { toast } from "utils/Toast";
import { TAB_KEYS } from "../../CollectionView";
import { CollectionsVariablesList } from "../CollectionsVariablesList";
import "./collectionsVariablesView.scss";

interface CollectionsVariablesViewProps {
  collectionId: string;
  activeTabKey: string;
}

export const CollectionsVariablesView: React.FC<CollectionsVariablesViewProps> = ({ collectionId, activeTabKey }) => {
  const [searchValue, setSearchValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isActiveInnerTab = activeTabKey === TAB_KEYS.VARIABLES;

  const entity = useBufferedCollectionEntity(collectionId);
  const name = useApiClientSelector((s) => entity.getName(s));

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
    saveBuffer(
      {
        entity,
        async save(changes, repositories) {
          await repositories.apiClientRecordsRepository.updateRecord(changes, changes.id);
        },
      },
      {
        onError(error) {
          console.error("Failed to update variables", error);
          notification.error({
            message: "Failed to update variables",
            description: error?.message || "An unexpected error occurred",
            placement: "bottomRight",
          });
        },
        onSuccess(changes) {
          toast.success("Variables updated successfully");
          trackVariablesSaved({
            type: "collection_variable",
            num_variables: Object.keys(changes.data.variables ?? {}).length,
          });
        },
        beforeSave() {
          setIsSaving(true);
        },
        afterSave() {
          setIsSaving(false);
        },
      }
    );
  }, [entity, saveBuffer]);

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
        isActiveInnerTab={isActiveInnerTab}
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
