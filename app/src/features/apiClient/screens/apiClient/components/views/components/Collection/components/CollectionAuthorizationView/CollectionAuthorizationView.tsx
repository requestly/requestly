import React, { useCallback, useState } from "react";
import AuthorizationView from "../../../request/components/AuthorizationView";
import { RQAPI } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import { KEYBOARD_SHORTCUTS } from "../../../../../../../../../../../src/constants/keyboardShortcuts";
import { RoleBasedComponent } from "features/rbac";
import { getDefaultAuth } from "../../../request/components/AuthorizationView/defaults";
import { useBufferedCollectionEntity, useIsBufferDirty } from "features/apiClient/slices/entities/hooks";
import { useApiClientSelector } from "features/apiClient/slices/hooks/base.hooks";
import { useSaveBuffer } from "features/apiClient/slices/buffer/hooks";
import { toast } from "utils/Toast";
import { useActiveTab } from "componentsV2/Tabs/slice";

interface Props {
  collectionId: string;
}

/**
 * Wrapper component to reuse Authorization View with buffered entity pattern.
 * Uses the buffer system for optimistic updates and dirty tracking.
 */
const CollectionAuthorizationView: React.FC<Props> = ({ collectionId }) => {
  const [isSaving, setIsSaving] = useState(false);
  const entity = useBufferedCollectionEntity(collectionId);
  
  const authOptions = useApiClientSelector((s) => entity.getAuth(s));
  const rootLevelRecord = useApiClientSelector((s) => !entity.getCollectionId(s));

  const hasUnsavedChanges = useIsBufferDirty({
    referenceId: collectionId,
    type: "referenceId",
  });

  const isActiveTab = useActiveTab();
  const saveBuffer = useSaveBuffer();

  const handleAuthUpdate = useCallback(
    (newAuthOptions: RQAPI.Auth) => {
      entity.setAuth(newAuthOptions);
    },
    [entity]
  );

  const onSaveAuthData = useCallback(async () => {
    saveBuffer(
      {
        entity,
        produceChanges: (entity, state) => {
          const authChanges = entity.getAuth(state);
          const collection = entity.getEntityFromState(state);
          // Ensure we always have an Auth value - use changes if present, otherwise fallback to existing auth
          const auth: RQAPI.Auth = authChanges ?? collection.data.auth;
          const record: RQAPI.CollectionRecord = {
            ...collection,
            data: {
              ...collection.data,
              auth,
            },
          };
          return record;
        },
        async save(changes, repositories) {
          const result = await repositories.apiClientRecordsRepository.updateCollectionAuthData(changes);
          if (!result.success) {
            throw new Error(result.message || "Failed to update authorization");
          }
        },
      },
      {
        beforeSave() {
          setIsSaving(true);
        },
        afterSave() {
          setIsSaving(false);
        },
        onSuccess() {
          toast.success("Authorization saved successfully");
        },
        onError(error) {
          console.error("Failed to update Authorization Values: ", error);
          toast.error("Failed to update authorization");
        },
      }
    );
  }, [entity, saveBuffer]);

  const AuthorizationViewActions = () => (
    <RoleBasedComponent resource="api_client_collection" permission="update">
      <div className="authorization-save-btn">
        <RQButton
          showHotKeyText
          hotKey={KEYBOARD_SHORTCUTS.API_CLIENT?.SAVE_COLLECTION?.hotKey}
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
      defaults={authOptions || getDefaultAuth(rootLevelRecord)}
      onAuthUpdate={handleAuthUpdate}
      isRootLevelRecord={rootLevelRecord}
      recordId={collectionId}
      authorizationViewActions={<AuthorizationViewActions />}
    />
  );
};

export default CollectionAuthorizationView;
