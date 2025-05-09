import { useApiClientContext } from "features/apiClient/contexts";
import { createBlankApiRecord } from "features/apiClient/screens/apiClient/utils";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { RQAPI } from "features/apiClient/types";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";
import { useState } from "react";
import { toast } from "utils/Toast";
import { trackNewCollectionClicked, trackNewRequestClicked } from "modules/analytics/events/features/apiClient";
import { variablesActions } from "store/features/variables/slice";
import { RBACButton } from "features/rbac";
import "./apiClientEmptyView.scss";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

export const ApiClientEmptyView = () => {
  const dispatch = useDispatch();

  const { apiClientRecords, onSaveRecord, apiClientRecordsRepository } = useApiClientContext();

  const user = useSelector(getUserAuthDetails);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);

  const [isRecordCreating, setIsRecordCreating] = useState(null);

  const isEmpty = apiClientRecords.length === 0;

  const handleNewRecordClick = (recordType: RQAPI.RecordType) => {
    recordType === RQAPI.RecordType.API
      ? trackNewRequestClicked("api_client_home")
      : trackNewCollectionClicked("api_client_home");

    if (!user.loggedIn) {
      dispatch(
        globalActions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            src: APP_CONSTANTS.FEATURES.API_CLIENT,
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
            eventSource: "api_client_empty_view",
          },
        })
      );
      return;
    }
    setIsRecordCreating(recordType);
    createBlankApiRecord(user?.details?.profile?.uid, activeWorkspaceId, recordType, "", apiClientRecordsRepository)
      .then((result) => {
        if (result.success) {
          onSaveRecord(result.data, "open");
          if (recordType === RQAPI.RecordType.COLLECTION) {
            dispatch(variablesActions.updateCollectionVariables({ collectionId: result.data.id, variables: {} }));
          }
        } else {
          toast.error(result.message || "Could not create a collection.");
        }
      })
      .catch((error) => {
        console.error("Error creating record", error);
        toast.error(error.message || "Could not create a collection.");
      })
      .finally(() => {
        setIsRecordCreating(null);
      });
  };

  return (
    <div className="api-client-empty-view-container">
      <div>
        <div className="api-client-empty-view-header">
          {isEmpty ? "No API requests created yet." : "Pick up where you left off or start fresh."}
        </div>
        <div className="api-client-empty-view-description">
          {isEmpty
            ? "Start by creating a collection for your requests or directly add your first request."
            : "View saved collections and requests, continue from where you left off, or start something new."}
        </div>
        <div className="api-client-empty-view-actions">
          <RBACButton
            permission="create"
            resource="api_client_request"
            tooltipTitle="Creating a new request is not allowed in view-only mode."
            loading={isRecordCreating === RQAPI.RecordType.API}
            onClick={() => handleNewRecordClick(RQAPI.RecordType.API)}
          >
            Create a new API request
          </RBACButton>
          <RBACButton
            permission="create"
            resource="api_client_collection"
            tooltipTitle="Creating a new collection is not allowed in view-only mode."
            loading={isRecordCreating === RQAPI.RecordType.COLLECTION}
            onClick={() => handleNewRecordClick(RQAPI.RecordType.COLLECTION)}
            type="primary"
          >
            Create a new collection
          </RBACButton>
        </div>
      </div>
    </div>
  );
};
