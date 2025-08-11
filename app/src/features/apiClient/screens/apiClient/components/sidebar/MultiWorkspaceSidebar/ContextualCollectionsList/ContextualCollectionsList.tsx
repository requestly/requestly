import { useApiClientMultiWorkspaceView } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { RQAPI } from "features/apiClient/types";
import { useRBAC } from "features/rbac";
import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { SidebarListHeader } from "../../components/sidebarListHeader/SidebarListHeader";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CollectionsList } from "./CollectionsList/CollectionsList";
import { ContextId } from "features/apiClient/contexts/contextId.context";
import { WorkspaceLoader } from "../WorkspaceLoader/WorkspaceLoader";

export const ContextualCollectionsList: React.FC<{
  onNewClick: (src: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType) => Promise<void>;
  recordTypeToBeCreated: RQAPI.RecordType | null;
}> = ({ onNewClick, recordTypeToBeCreated }) => {
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const selectedWorkspaces = useApiClientMultiWorkspaceView((s) => s.selectedWorkspaces);

  const [searchValue, setSearchValue] = useState("");

  // const toggleSelection = useCallback(() => {
  //   setSelectedRecords(new Set());
  //   setShowSelection((prev) => !prev);
  //   setIsAllRecordsSelected(false);
  // }, [setSelectedRecords, setShowSelection]);

  // const multiSelectOptions = {
  //   showMultiSelect: isValidPermission,
  //   toggleMultiSelect: toggleSelection,
  // };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="api-client-sidebar-header-container">
        <SidebarListHeader
          onSearch={setSearchValue}
          // multiSelectOptions={multiSelectOptions}
          newRecordActionOptions={{
            showNewRecordAction: isValidPermission,
            onNewRecordClick: onNewClick,
          }}
        />

        {/* {showSelection && (
          <ActionMenu
            isAllRecordsSelected={isAllRecordsSelected}
            toggleSelection={toggleSelection}
            bulkActionsHandler={bulkActionHandler}
          />
        )} */}
      </div>

      {selectedWorkspaces.map((workspace) => {
        return (
          <ContextId id={workspace.getState().id}>
            <WorkspaceLoader>
              <CollectionsList
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
