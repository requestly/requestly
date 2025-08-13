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
import { toast } from "utils/Toast";
import { capitalize } from "lodash";
import { useApiClientFeatureContextProvider } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

export const ContextualCollectionsList: React.FC<{
  onNewClick: (src: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType) => Promise<void>;
  recordTypeToBeCreated: RQAPI.RecordType | null;
}> = ({ onNewClick, recordTypeToBeCreated }) => {
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const selectedWorkspaces = useApiClientMultiWorkspaceView((s) => s.selectedWorkspaces);
  const getContext = useApiClientFeatureContextProvider((s) => s.getContext);

  const [searchValue, setSearchValue] = useState("");
  const [showSelection, setShowSelection] = useState(false);
  const [isAllRecordsSelected, setIsAllRecordsSelected] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkActions | null>(null);
  const [selectedRecordsAcrossWorkspaces, setSelectedRecordsAcrossWorkspaces] = useState<{
    [contextId: string]: Set<string>;
  } | null>(null);

  const bulkActionHandler = useCallback(
    async (action: BulkActions) => {
      const isRecordsSelectedAcrossWorkspaces = Object.keys(selectedRecordsAcrossWorkspaces).length > 1;
      if (isRecordsSelectedAcrossWorkspaces) {
        if ([BulkActions.MOVE, BulkActions.EXPORT].includes(action)) {
          toast.error(`${capitalize(action)} not supported across workspaces!`);
          return;
        }
      }

      setBulkAction(action);
    },
    [selectedRecordsAcrossWorkspaces]
  );

  const deselectRecords = useCallback(() => {
    setIsAllRecordsSelected(false);
    setSelectedRecordsAcrossWorkspaces(null);
  }, []);

  const handleShowSelection = useCallback((value: boolean) => {
    setShowSelection(value);
  }, []);

  const multiSelectOptions = {
    showMultiSelect: isValidPermission,
    toggleMultiSelect: deselectRecords,
  };

  const handleRecordSelection = useCallback((contextId: string, recordIds: string[]) => {
    setSelectedRecordsAcrossWorkspaces((prev) => ({
      ...(prev ?? {}),
      [contextId]: new Set(recordIds),
    }));
  }, []);

  console.log({ selectedWorkspaces });

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
        const workspaceId = workspace.getState().id;
        const contextId = getContext(workspaceId)?.id;

        return (
          <WorkspaceLoader workspaceId={workspaceId}>
            <ContextId id={contextId} key={contextId}>
              <CollectionsList
                bulkAction={bulkAction}
                isAllRecordsSelected={isAllRecordsSelected}
                showSelection={showSelection}
                handleShowSelection={handleShowSelection}
                searchValue={searchValue}
                onNewClick={onNewClick}
                recordTypeToBeCreated={recordTypeToBeCreated}
                handleRecordSelection={(recordIds) => handleRecordSelection(contextId, recordIds)}
              />
            </ContextId>
          </WorkspaceLoader>
        );
      })}
    </DndProvider>
  );
};
