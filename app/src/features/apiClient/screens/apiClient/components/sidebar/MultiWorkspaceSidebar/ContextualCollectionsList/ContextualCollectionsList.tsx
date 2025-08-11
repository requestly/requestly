import { useApiClientMultiWorkspaceView } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { BulkActions, RQAPI } from "features/apiClient/types";
import { useRBAC } from "features/rbac";
import React, { useCallback, useState } from "react";
import { DndProvider } from "react-dnd";
import { SidebarListHeader } from "../../components/sidebarListHeader/SidebarListHeader";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CollectionsList } from "./CollectionsList/CollectionsList";
import { ContextId } from "features/apiClient/contexts/contextId.context";
import { WorkspaceLoader } from "../WorkspaceLoader/WorkspaceLoader";
import ActionMenu from "../../components/collectionsList/BulkActionsMenu";

export const ContextualCollectionsList: React.FC<{
  onNewClick: (src: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType) => Promise<void>;
  recordTypeToBeCreated: RQAPI.RecordType | null;
}> = ({ onNewClick, recordTypeToBeCreated }) => {
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const selectedWorkspaces = useApiClientMultiWorkspaceView((s) => s.selectedWorkspaces);

  const [searchValue, setSearchValue] = useState("");
  const [showSelection, setShowSelection] = useState(false);
  const [isAllRecordsSelected, setIsAllRecordsSelected] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkActions | null>(null);

  const bulkActionHandler = useCallback(async (action: BulkActions) => {
    // TODO: handle special cases for move and export
    setBulkAction(action);
  }, []);

  const deselectRecords = useCallback(() => {
    setIsAllRecordsSelected(false);
  }, []);

  const handleShowSelection = useCallback((value: boolean) => {
    setShowSelection(value);
  }, []);

  const multiSelectOptions = {
    showMultiSelect: isValidPermission,
    toggleMultiSelect: deselectRecords,
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="api-client-sidebar-header-container">
        <SidebarListHeader
          onSearch={setSearchValue}
          multiSelectOptions={multiSelectOptions}
          newRecordActionOptions={{
            showNewRecordAction: isValidPermission,
            onNewRecordClick: onNewClick,
          }}
        />

        {showSelection && (
          <ActionMenu
            isAllRecordsSelected={isAllRecordsSelected}
            toggleSelection={deselectRecords}
            bulkActionsHandler={bulkActionHandler}
          />
        )}
      </div>

      {selectedWorkspaces.map((workspace) => {
        return (
          <ContextId id={workspace.getState().id}>
            <WorkspaceLoader>
              <CollectionsList
                bulkAction={bulkAction}
                isAllRecordsSelected={isAllRecordsSelected}
                showSelection={showSelection}
                handleShowSelection={handleShowSelection}
                searchValue={searchValue}
                onNewClick={onNewClick}
                recordTypeToBeCreated={recordTypeToBeCreated}
              />
            </WorkspaceLoader>
          </ContextId>
        );
      })}
    </DndProvider>
  );
};
