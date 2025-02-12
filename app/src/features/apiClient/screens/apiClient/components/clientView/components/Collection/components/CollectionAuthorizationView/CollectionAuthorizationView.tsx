import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useHasUnsavedChanges } from "hooks";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import AuthorizationView from "../../../request/components/AuthorizationView";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { RQAPI } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import { KEYBOARD_SHORTCUTS } from "../../../../../../../../../../../src/constants/keyboardShortcuts";

interface Props {
  authOptions: RQAPI.Auth;
  updateAuthData: (authOptions: RQAPI.Auth) => any;
  rootLevelRecord: Boolean;
}

/**
 *
 * Wrapper component to reuse Authorization View
 * Problem -> Saving the authorization data on typing were causing re-render which were resulting in losing focus from the input field.
 * Solution -> To fix this creating this wrapper component for Authorization View so that save logic can be added
 * and remain separated from the main Collection View
 *
 */
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

  const onSaveAuthData = useCallback(() => {
    setIsSaving(true);
    updateAuthData(authOptionsState)
      .then(() => resetChanges())
      .catch((error: Error) => {
        console.error("Failed to update Authorization Values: ", error);
      })
      .finally(() => {
        setIsSaving(false);
      });
  }, [authOptionsState, resetChanges, updateAuthData]);

  const AuthorizationViewActions = () => (
    <div className="authorization-save-btn">
      <RQButton
        showHotKeyText
        hotKey={KEYBOARD_SHORTCUTS.API_CLIENT.SAVE_ENVIRONMENT.hotKey}
        type="primary"
        onClick={onSaveAuthData}
        disabled={!hasUnsavedChanges}
        loading={isSaving}
      >
        Save
      </RQButton>
    </div>
  );

  return (
    <AuthorizationView
      wrapperClass="collection-auth"
      defaultValues={authOptionsState}
      onAuthUpdate={setAuthOptionsState}
      rootLevelRecord={rootLevelRecord}
      variables={variables}
      authorizationViewActions={<AuthorizationViewActions />}
    />
  );
};

export default CollectionAuthorizationView;
