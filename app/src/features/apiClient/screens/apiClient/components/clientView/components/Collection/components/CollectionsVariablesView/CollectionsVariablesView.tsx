import React, { useEffect, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { VariablesList } from "features/apiClient/screens/environment/components/VariablesList/VariablesList";
import { getCollectionVariables } from "store/features/variables/selectors";
import { useSelector } from "react-redux";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { VariablesListHeader } from "features/apiClient/screens/environment/components/VariablesListHeader/VariablesListHeader";
import { toast } from "utils/Toast";
import { useHasUnsavedChanges } from "hooks";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import "./collectionsVariablesView.scss";
import { trackVariablesUpdated } from "modules/analytics/events/features/apiClient";
import { getUpdatedVariableCount } from "features/apiClient/screens/apiClient/utils";

interface CollectionsVariablesViewProps {
  collection: RQAPI.CollectionRecord;
}

export const CollectionsVariablesView: React.FC<CollectionsVariablesViewProps> = ({ collection }) => {
  const { updateTab } = useTabsLayoutContext();
  const { setCollectionVariables } = useEnvironmentManager();
  const collectionVariables = useSelector(getCollectionVariables);
  const [pendingVariables, setPendingVariables] = useState(collectionVariables[collection.id]?.variables || {});
  const [searchValue, setSearchValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { hasUnsavedChanges, resetChanges } = useHasUnsavedChanges(pendingVariables);

  useEffect(() => {
    updateTab(collection.id, { hasUnsavedChanges: hasUnsavedChanges });
  }, [updateTab, collection.id, hasUnsavedChanges]);

  const handleSaveVariables = async () => {
    setIsSaving(true);
    return setCollectionVariables(pendingVariables, collection.id)
      .then(() => {
        toast.success("Variables updated successfully");
        trackVariablesUpdated({
          type: "collection_variable",
          updated_variable_count: getUpdatedVariableCount(
            collectionVariables[collection.id]?.variables,
            pendingVariables
          ),
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
        variables={collectionVariables[collection.id]?.variables || {}}
        onVariablesChange={setPendingVariables}
        searchValue={searchValue}
      />
    </div>
  );
};
