import React, { useCallback, useEffect, useState } from "react";
import { useHasUnsavedChanges } from "hooks";
import AuthorizationView from "../../../request/components/AuthorizationView";
import { RQAPI } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import { KEYBOARD_SHORTCUTS } from "../../../../../../../../../../../src/constants/keyboardShortcuts";
import { RoleBasedComponent } from "features/rbac";
import { useGenericState } from "hooks/useGenericState";
import { getDefaultAuth } from "../../../request/components/AuthorizationView/defaults";

interface Props {
  collectionId: string;
  authOptions?: RQAPI.Auth;
  updateAuthData: (authOptions: RQAPI.Auth) => any;
  rootLevelRecord: boolean;
}

/**
 *
 * Wrapper component to reuse Authorization View
 * Problem -> Saving the authorization data on typing were causing re-render which were resulting in losing focus from the input field.
 * Solution -> To fix this creating this wrapper component for Authorization View so that save logic can be added
 * and remain separated from the main Collection View
 *
 */
const CollectionAuthorizationView: React.FC<Props> = ({
  collectionId,
  authOptions,
  updateAuthData,
  rootLevelRecord,
}) => {
  const [authOptionsState, setAuthOptionsState] = useState<RQAPI.Auth>(authOptions || getDefaultAuth(rootLevelRecord));
  const [isSaving, setIsSaving] = useState(false);
  const { setPreview, setUnsaved, getIsActive } = useGenericState();
  const { hasUnsavedChanges, resetChanges } = useHasUnsavedChanges(authOptionsState);

  const isActiveTab = getIsActive();

  useEffect(() => {
    setUnsaved(hasUnsavedChanges);

    if (hasUnsavedChanges) {
      setPreview(false);
    }
  }, [setUnsaved, setPreview, hasUnsavedChanges]);

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
    <RoleBasedComponent resource="api_client_collection" permission="update">
      <div className="authorization-save-btn">
        <RQButton
          showHotKeyText
          hotKey={KEYBOARD_SHORTCUTS.API_CLIENT.SAVE_COLLECTION.hotKey}
          type="primary"
          onClick={onSaveAuthData}
          disabled={!hasUnsavedChanges}
          loading={isSaving}
          enableHotKey={isActiveTab}
        >
          Save
        </RQButton>
      </div>
    </RoleBasedComponent>
  );

  return (
    <AuthorizationView
      wrapperClass="collection-auth"
      defaults={authOptionsState}
      onAuthUpdate={setAuthOptionsState}
      isRootLevelRecord={rootLevelRecord}
      recordId={collectionId}
      authorizationViewActions={<AuthorizationViewActions />}
    />
  );
};

export default CollectionAuthorizationView;
