import React, { useEffect, useRef, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import {
  EnvironmentVariableTableRow,
  VariablesList,
} from "features/apiClient/screens/environment/components/VariablesList/VariablesList";
import { VariablesListHeader } from "features/apiClient/screens/environment/components/VariablesListHeader/VariablesListHeader";
import { toast } from "utils/Toast";
import { useHasUnsavedChanges } from "hooks";
import { trackVariablesSaved } from "modules/analytics/events/features/apiClient";
import { useGenericState } from "hooks/useGenericState";
import { convertEnvironmentToMap, mapToEnvironmentArray } from "features/apiClient/screens/environment/utils";
import "./collectionsVariablesView.scss";
import { useCommand } from "features/apiClient/commands";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { CollectionRecordState } from "features/apiClient/store/apiRecords/apiRecords.store";
import { useVariableStore } from "features/apiClient/hooks/useVariable.hook";

interface CollectionsVariablesViewProps {
  collection: RQAPI.CollectionRecord;
}

export const CollectionsVariablesView: React.FC<CollectionsVariablesViewProps> = ({ collection }) => {
  const getRecord = useAPIRecords((s) => s.getRecordStore);
  const collectionRecordState = getRecord(collection.id)!.getState() as CollectionRecordState;
  const variablesMap = useVariableStore(collectionRecordState.collectionVariables);
  const variables = Object.fromEntries(variablesMap.data);

  const {
    api: { patchCollectionVariables },
  } = useCommand();
  const pendingVariablesRef = useRef<EnvironmentVariableTableRow[]>([]);

  const [pendingVariables, setPendingVariables] = useState(mapToEnvironmentArray(variables) || []);
  const [searchValue, setSearchValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { setPreview, setUnsaved } = useGenericState();
  const { hasUnsavedChanges, resetChanges } = useHasUnsavedChanges(pendingVariables);

  useEffect(() => {
    setUnsaved(hasUnsavedChanges);

    if (hasUnsavedChanges) {
      setPreview(false);
    }
  }, [setUnsaved, setPreview, hasUnsavedChanges]);

  useEffect(() => {
    if (!isSaving) {
      handleSetPendingVariables(
        pendingVariablesRef.current.length > 0 ? pendingVariablesRef.current : mapToEnvironmentArray(variables)
      );
    }
  }, [collection.id, collection?.data?.variables, variables, isSaving]);

  const handleSetPendingVariables = (variables: EnvironmentVariableTableRow[]) => {
    setPendingVariables(variables);
    pendingVariablesRef.current = variables;
  };

  const handleSaveVariables = async () => {
    setIsSaving(true);
    const variablesToSave = convertEnvironmentToMap(pendingVariables);
    return patchCollectionVariables({
      collectionId: collection.id,
      patch: variablesToSave,
    })
      .then(() => {
        toast.success("Variables updated successfully");
        trackVariablesSaved({
          type: "collection_variable",
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
      <VariablesList
        variables={pendingVariables}
        onVariablesChange={handleSetPendingVariables}
        searchValue={searchValue}
      />
    </div>
  );
};
