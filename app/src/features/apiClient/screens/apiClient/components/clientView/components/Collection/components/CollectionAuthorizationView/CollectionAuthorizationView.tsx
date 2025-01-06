import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useHasUnsavedChanges } from "hooks";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import AuthorizationView from "../../../request/components/AuthorizationView";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { RQAPI } from "features/apiClient/types";

interface Props {
  authOptions: RQAPI.AuthOptions;
  updateAuthData: (authOptions: RQAPI.AuthOptions) => any;
  rootLevelRecord: Boolean;
}

const CollectionAuthorizationView: React.FC<Props> = ({ authOptions, updateAuthData, rootLevelRecord }) => {
  const { collectionId } = useParams();
  const [authOptionsState, setAuthOptionsState] = useState(authOptions);
  const [isSaving, setIsSaving] = useState(false);

  const { getVariablesWithPrecedence } = useEnvironmentManager();
  const variables = useMemo(() => getVariablesWithPrecedence(collectionId), [collectionId, getVariablesWithPrecedence]);

  const { updateTab } = useTabsLayoutContext();

  const { hasUnsavedChanges, resetChanges } = useHasUnsavedChanges(authOptionsState);

  useEffect(() => {
    updateTab(collectionId, { hasUnsavedChanges: hasUnsavedChanges });
  }, [updateTab, collectionId, hasUnsavedChanges]);

  const onSaveAuthData = () => {
    setIsSaving(true);
    updateAuthData(authOptionsState)
      .then(() => resetChanges())
      .catch((error: Error) => {
        console.error("Failed to update Authorization Values: ", error);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <AuthorizationView
      wrapperClass="collection-auth"
      defaultValues={authOptionsState}
      onAuthUpdate={setAuthOptionsState}
      rootLevelRecord={rootLevelRecord}
      variables={variables}
      showSaveButton
      onSaveButtonClick={onSaveAuthData}
      hasUnsavedChanges={hasUnsavedChanges}
      savingChanges={isSaving}
    />
  );
};

export default CollectionAuthorizationView;
