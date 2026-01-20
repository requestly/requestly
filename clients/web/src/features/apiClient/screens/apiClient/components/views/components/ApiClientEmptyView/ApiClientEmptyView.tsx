import { createBlankApiRecord } from "features/apiClient/screens/apiClient/utils";
import { useDispatch } from "react-redux";
import { RQAPI } from "features/apiClient/types";
import { useState } from "react";
import { trackNewCollectionClicked, trackNewRequestClicked } from "modules/analytics/events/features/apiClient";
import { variablesActions } from "store/features/variables/slice";
import { RBACButton, useRBAC } from "features/rbac";
import { notification } from "antd";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import {
  NewApiRecordDropdown,
  NewRecordDropdownItemType,
} from "../../../sidebar/components/NewApiRecordDropdown/NewApiRecordDropdown";
import "./apiClientEmptyView.scss";
import { useApiClientRepository } from "features/apiClient/contexts/meta";
import { useNewApiClientContext } from "features/apiClient/hooks/useNewApiClientContext";

export const ApiClientEmptyView = () => {
  const dispatch = useDispatch();

  const apiClientRecords = useAPIRecords((state) => state.apiClientRecords);
  const { onSaveRecord } = useNewApiClientContext();
  const { apiClientRecordsRepository } = useApiClientRepository();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");

  const [isRecordCreating, setIsRecordCreating] = useState<RQAPI.RecordType | null>(null);

  const isEmpty = apiClientRecords.length === 0;

  const collectionButton = (
    <RBACButton
      permission="create"
      resource="api_client_collection"
      tooltipTitle="Creating a new collection is not allowed in view-only mode."
      loading={isRecordCreating === RQAPI.RecordType.COLLECTION}
      onClick={() => handleNewRecordClick(RQAPI.RecordType.COLLECTION)}
      type={isEmpty ? "primary" : "secondary"}
    >
      Create a new collection
    </RBACButton>
  );

  const requestButton = (
    <NewApiRecordDropdown
      disabled={!isValidPermission}
      onSelect={(params: { recordType: RQAPI.RecordType; entryType?: RQAPI.ApiEntryType }) =>
        handleNewRecordClick(params.recordType, params?.entryType)
      }
      buttonProps={{
        disabled: !isValidPermission,
        loading: isRecordCreating === RQAPI.RecordType.API,
        children: "Create a new request",
        type: isEmpty ? "default" : "primary",
      }}
      invalidActions={[NewRecordDropdownItemType.ENVIRONMENT, NewRecordDropdownItemType.COLLECTION]}
    />
  );

  const handleNewRecordClick = (recordType: RQAPI.RecordType, entryType?: RQAPI.ApiEntryType) => {
    recordType === RQAPI.RecordType.API
      ? trackNewRequestClicked("api_client_home")
      : trackNewCollectionClicked("api_client_home");

    setIsRecordCreating(recordType);
    createBlankApiRecord(recordType, "", apiClientRecordsRepository, entryType)
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
          {isEmpty ? (
            <>
              {collectionButton}
              {requestButton}
            </>
          ) : (
            <>
              {requestButton}
              {collectionButton}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
