import React, { useEffect, useMemo, useRef, useState } from "react";
import { RQAPI } from "features/apiClient/types";
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
import { NativeError } from "errors/NativeError";
import { CollectionsVariablesList } from "../CollectionsVariablesList";
import { VariableRow } from "features/apiClient/screens/environment/components/VariablesList/VariablesList";

interface CollectionsVariablesViewProps {
  collection: RQAPI.CollectionRecord;
}

export const CollectionsVariablesView: React.FC<CollectionsVariablesViewProps> = ({ collection }) => {
  const getRecord = useAPIRecords((s) => s.getRecordStore);

  const collectionRecord = getRecord(collection.id);
  if (!collectionRecord) throw new NativeError(`Collection Record ${collection.id} not found`);
  const collectionRecordState = collectionRecord.getState() as CollectionRecordState;

  const variablesMap = useVariableStore(collectionRecordState.collectionVariables);
  const variables = useMemo(() => Object.fromEntries(variablesMap.data), [variablesMap]);

  const {
    api: { setCollectionVariables },
  } = useCommand();
  const pendingVariablesRef = useRef<VariableRow[]>([]);

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

  const handleSetPendingVariables = (variables: VariableRow[]) => {
    setPendingVariables(variables);
    pendingVariablesRef.current = variables;
  };

  const handleSaveVariables = async () => {
    setIsSaving(true);

    const variablesToSave = convertEnvironmentToMap(pendingVariables);
    return setCollectionVariables({
      collectionId: collection.id,
      variables: variablesToSave,
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
      <CollectionsVariablesList
        variables={pendingVariables}
        onVariablesChange={handleSetPendingVariables}
        searchValue={searchValue}
        onSearchValueChange={setSearchValue}
      />
    </div>
  );
};
