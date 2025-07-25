import { useApiClientContext } from "features/apiClient/contexts";
import { createBlankApiRecord } from "features/apiClient/screens/apiClient/utils";
import { useDispatch } from "react-redux";
import { RQAPI } from "features/apiClient/types";
import { useState } from "react";
import { trackNewCollectionClicked, trackNewRequestClicked } from "modules/analytics/events/features/apiClient";
import { variablesActions } from "store/features/variables/slice";
import { RBACButton } from "features/rbac";
import { notification } from "antd";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import "./apiClientEmptyView.scss";

export const ApiClientEmptyView = () => {
  const dispatch = useDispatch();

  const apiClientRecords = useAPIRecords((state) => state.apiClientRecords);
  const { onSaveRecord, apiClientRecordsRepository } = useApiClientContext();

  const [isRecordCreating, setIsRecordCreating] = useState(null);

  const isEmpty = apiClientRecords.length === 0;

  const handleNewRecordClick = (recordType: RQAPI.RecordType) => {
    recordType === RQAPI.RecordType.API
      ? trackNewRequestClicked("api_client_home")
      : trackNewCollectionClicked("api_client_home");

    setIsRecordCreating(recordType);
    createBlankApiRecord(recordType, "", apiClientRecordsRepository)
      .then((result) => {
        if (result.success) {
          onSaveRecord(result.data, "open");
          if (recordType === RQAPI.RecordType.COLLECTION) {
            dispatch(variablesActions.updateCollectionVariables({ collectionId: result.data.id, variables: {} }));
          }
        } else {
          notification.error({
            message: `Could not create ${recordType === RQAPI.RecordType.API ? "request" : "collection"}.`,
            description: result?.message,
            placement: "bottomRight",
          });
        }
      })
      .catch((error) => {
        notification.error({
          message: `Could not create ${recordType === RQAPI.RecordType.API ? "request" : "collection"}.`,
          description: error?.message,
          placement: "bottomRight",
        });
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
