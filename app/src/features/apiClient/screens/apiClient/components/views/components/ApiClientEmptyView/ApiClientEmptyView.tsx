import { RQAPI } from "features/apiClient/types";
import { RBACButton, useRBAC } from "features/rbac";
import {
  NewApiRecordDropdown,
  NewRecordDropdownItemType,
} from "../../../sidebar/components/NewApiRecordDropdown/NewApiRecordDropdown";
import "./apiClientEmptyView.scss";
import { useApiClientContext } from "features/apiClient/contexts";

export const ApiClientEmptyView = () => {
  const { onNewClick, isRecordBeingCreated } = useApiClientContext();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");

  const handleNewRecordClick = (recordType: RQAPI.RecordType, entryType?: RQAPI.ApiEntryType) => {
    onNewClick("api_client_home", recordType, "", entryType);
  };

  return (
    <div className="api-client-empty-view-container">
      <div>
        <div className="api-client-empty-view-header">Get started with API Client</div>
        <div className="api-client-empty-view-description">
          Create a collection to organize your requests, or jump right in by adding your first request.
        </div>
        <div className="api-client-empty-view-actions">
          <RBACButton
            permission="create"
            resource="api_client_collection"
            tooltipTitle="Creating a new collection is not allowed in view-only mode."
            loading={isRecordBeingCreated === RQAPI.RecordType.COLLECTION}
            onClick={() => handleNewRecordClick(RQAPI.RecordType.COLLECTION)}
            type="primary"
          >
            Create a new collection
          </RBACButton>
          <NewApiRecordDropdown
            disabled={!isValidPermission}
            onSelect={(params: { recordType: RQAPI.RecordType; entryType?: RQAPI.ApiEntryType }) =>
              handleNewRecordClick(params.recordType, params?.entryType)
            }
            buttonProps={{
              disabled: !isValidPermission,
              loading: isRecordBeingCreated === RQAPI.RecordType.API,
              children: "Create a new request",
              type: "default",
            }}
            invalidActions={[NewRecordDropdownItemType.ENVIRONMENT, NewRecordDropdownItemType.COLLECTION]}
          />
        </div>
      </div>
    </div>
  );
};
