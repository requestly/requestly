import { RQAPI } from "features/apiClient/types";
import { RBACButton, useRBAC } from "features/rbac";
import { useIsAnyWorkspaceLoading, useTotalRecords } from "features/apiClient/slices";
import {
  NewApiRecordDropdown,
  NewRecordDropdownItemType,
} from "../../../sidebar/components/NewApiRecordDropdown/NewApiRecordDropdown";
import "./apiClientEmptyView.scss";
import { WorkspaceProvider } from "features/apiClient/common/WorkspaceProvider";
import { useApiClientContext } from "features/apiClient/contexts";
import { Skeleton } from "antd";

const ApiClientEmptyViewContent = () => {
  const totalRecords = useTotalRecords();
  const { onNewClick, isRecordBeingCreated } = useApiClientContext();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");

  const isEmpty = totalRecords === 0;

  const handleNewRecordClick = (recordType: RQAPI.RecordType, entryType?: RQAPI.ApiEntryType) => {
    onNewClick("api_client_home", recordType, "", entryType);
  };

  const collectionButton = (
    <RBACButton
      permission="create"
      resource="api_client_collection"
      tooltipTitle="Creating a new collection is not allowed in view-only mode."
      loading={isRecordBeingCreated === RQAPI.RecordType.COLLECTION}
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
        loading: isRecordBeingCreated === RQAPI.RecordType.API,
        children: "Create a new request",
        type: isEmpty ? "default" : "primary",
      }}
      invalidActions={[NewRecordDropdownItemType.ENVIRONMENT, NewRecordDropdownItemType.COLLECTION]}
    />
  );

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

export const ApiClientEmptyView = () => {
  const isLoading = useIsAnyWorkspaceLoading();

  if (isLoading) {
    return (
      <div className="api-client-empty-view-container">
        <Skeleton active className="api-client-header-skeleton" paragraph={{ rows: 3, width: "100%" }} />
      </div>
    );
  }

  return (
    <WorkspaceProvider>
      <ApiClientEmptyViewContent />
    </WorkspaceProvider>
  );
};
