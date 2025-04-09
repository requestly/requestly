import React, { useEffect, useRef, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { VariablesList } from "features/apiClient/screens/environment/components/VariablesList/VariablesList";
import { getCollectionVariables } from "store/features/variables/selectors";
import { useSelector } from "react-redux";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { VariablesListHeader } from "features/apiClient/screens/environment/components/VariablesListHeader/VariablesListHeader";
import { toast } from "utils/Toast";
import { useHasUnsavedChanges } from "hooks";
import { trackVariablesSaved } from "modules/analytics/events/features/apiClient";
import { useGenericState } from "hooks/useGenericState";
import "./collectionsVariablesView.scss";
import { EnvironmentVariables } from "backend/environment/types";

interface CollectionsVariablesViewProps {
  collection: RQAPI.CollectionRecord;
}

export const CollectionsVariablesView: React.FC<CollectionsVariablesViewProps> = ({ collection }) => {
  const { setCollectionVariables } = useEnvironmentManager();
  const collectionVariables = useSelector(getCollectionVariables);

  const pendingVariablesRef = useRef<EnvironmentVariables>(null);

  const [pendingVariables, setPendingVariables] = useState(collectionVariables[collection.id]?.variables || {});
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
      handleSetPendingVariables(pendingVariablesRef.current ?? collectionVariables[collection.id]?.variables);
    }
  }, [collection.id, collectionVariables, isSaving]);

  const handleSetPendingVariables = (variables: EnvironmentVariables = {}) => {
    setPendingVariables(variables);
    pendingVariablesRef.current = variables;
  };

  const handleSaveVariables = async () => {
    setIsSaving(true);
    return setCollectionVariables(pendingVariables, collection.id)
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
