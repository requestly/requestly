import { useApiClientMultiWorkspaceView } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { BulkActions, RQAPI } from "features/apiClient/types";
import { useRBAC } from "features/rbac";
import React, { useCallback, useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { SidebarListHeader } from "../../components/sidebarListHeader/SidebarListHeader";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CollectionsList } from "./CollectionsList/CollectionsList";
import { ContextId } from "features/apiClient/contexts/contextId.context";
import { WorkspaceLoader } from "../WorkspaceLoader/WorkspaceLoader";
import ActionMenu from "../../components/collectionsList/BulkActionsMenu";
import { toast } from "utils/Toast";
import { capitalize } from "lodash";
import {
  apiClientFeatureContextProviderStore,
  useApiClientFeatureContextProvider,
} from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";

export const ContextualCollectionsList: React.FC<{
  onNewClick: (src: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType) => Promise<void>;
  recordTypeToBeCreated: RQAPI.RecordType | null;
}> = ({ onNewClick, recordTypeToBeCreated }) => {
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const selectedWorkspaces = useApiClientMultiWorkspaceView((s) => s.selectedWorkspaces);
  const [getContext] = useApiClientFeatureContextProvider((s) => [s.getContext]);

  const [searchValue, setSearchValue] = useState("");
  const [showSelection, setShowSelection] = useState(false);
  const [isAllRecordsSelected, setIsAllRecordsSelected] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkActions | null>(null);
  const [selectedRecordsAcrossWorkspaces, setSelectedRecordsAcrossWorkspaces] = useState<{
    [contextId: string]: Set<string>;
  } | null>(null);

  const bulkActionHandler = useCallback(
    async (action: BulkActions) => {
      const isRecordsSelectedAcrossWorkspaces = Object.keys(selectedRecordsAcrossWorkspaces ?? {}).length > 1;

      if (isRecordsSelectedAcrossWorkspaces) {
        if ([BulkActions.MOVE, BulkActions.EXPORT].includes(action)) {
          toast.error(`${capitalize(action)} not supported across workspaces!`);
          return;
        }
      }

      if (action === BulkActions.SELECT_ALL) {
        setIsAllRecordsSelected((prev) => !prev);
      }

      setBulkAction(action);
    },
    [selectedRecordsAcrossWorkspaces]
  );

  const toggleMultiSelect = useCallback(() => {
    setShowSelection((prev) => !prev);
    setIsAllRecordsSelected(false);
    setSelectedRecordsAcrossWorkspaces(null);
  }, []);

  useEffect(() => {
    if (showSelection) {
      setSelectedRecordsAcrossWorkspaces(null);
    }
  }, [showSelection]);

  const handleShowSelection = useCallback((value: boolean) => {
    setShowSelection(value);
  }, []);

  const clearBulkAction = useCallback(() => {
    setBulkAction(null);
  }, []);

  const multiSelectOptions = {
    toggleMultiSelect,
    showMultiSelect: isValidPermission,
  };

  const handleRecordSelection = useCallback((contextId: string, recordIds: string[]) => {
    setSelectedRecordsAcrossWorkspaces((prev) => {
      return recordIds.length
        ? {
            ...(prev ?? {}),
            [contextId]: new Set(recordIds),
          }
        : prev;
    });
  }, []);

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
            toggleSelection={toggleMultiSelect}
            bulkActionsHandler={bulkActionHandler}
          />
        )}
      </div>

      {selectedWorkspaces.map((workspace) => {
        const workspaceId = workspace.getState().id;

        return (
          <WorkspaceLoader key={workspaceId} workspaceId={workspaceId}>
            <ContextId id={getContext(workspaceId)?.id}>
              <h3>{workspace.getState().name}</h3>
              <CollectionsList
                bulkAction={bulkAction}
                clearBulkAction={clearBulkAction}
                isAllRecordsSelected={isAllRecordsSelected}
                showSelection={showSelection}
                handleShowSelection={handleShowSelection}
                searchValue={searchValue}
                onNewClick={onNewClick}
                recordTypeToBeCreated={recordTypeToBeCreated}
                handleRecordSelection={(recordIds) => handleRecordSelection(getContext(workspaceId)?.id, recordIds)}
              />
            </ContextId>
          </WorkspaceLoader>
        );
      })}
    </DndProvider>
  );
};
