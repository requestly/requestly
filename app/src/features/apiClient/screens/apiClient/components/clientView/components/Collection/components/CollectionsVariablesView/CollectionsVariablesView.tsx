import React, { useEffect, useRef, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import {
  EnvironmentVariableTableRow,
  VariablesList,
} from "features/apiClient/screens/environment/components/VariablesList/VariablesList";
import { getCollectionVariables } from "store/features/variables/selectors";
import { useSelector } from "react-redux";
import { useEnvironment } from "features/apiClient/hooks/useEnvironment";
import { VariablesListHeader } from "features/apiClient/screens/environment/components/VariablesListHeader/VariablesListHeader";
import { toast } from "utils/Toast";
import { useHasUnsavedChanges } from "hooks";
import { trackVariablesSaved } from "modules/analytics/events/features/apiClient";
import { useGenericState } from "hooks/useGenericState";
import { convertEnvironmentToMap, mapToEnvironmentArray } from "features/apiClient/screens/environment/utils";
import "./collectionsVariablesView.scss";

interface CollectionsVariablesViewProps {
  collection: RQAPI.CollectionRecord;
}

export const CollectionsVariablesView: React.FC<CollectionsVariablesViewProps> = ({ collection }) => {
  const { setCollectionVariables } = useEnvironment();
  const collectionVariables = useSelector(getCollectionVariables);

  const pendingVariablesRef = useRef<EnvironmentVariableTableRow[]>([]);

  const [pendingVariables, setPendingVariables] = useState(
    mapToEnvironmentArray(collectionVariables[collection.id]?.variables ?? collection.data?.variables) || []
  );
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
        pendingVariablesRef.current.length > 0
          ? pendingVariablesRef.current
          : mapToEnvironmentArray(collectionVariables[collection.id]?.variables ?? collection.data.variables)
      );
    }
  }, [collection.id, collection?.data?.variables, collectionVariables, isSaving]);

  const handleSetPendingVariables = (variables: EnvironmentVariableTableRow[]) => {
    setPendingVariables(variables);
    pendingVariablesRef.current = variables;
  };

  const handleSaveVariables = async () => {
    setIsSaving(true);
    const variablesToSave = convertEnvironmentToMap(pendingVariables);
    return setCollectionVariables(variablesToSave, collection.id)
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
