import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApiClientMultiWorkspaceView } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { BulkActions, RQAPI } from "features/apiClient/types";
import { useRBAC } from "features/rbac";
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
import { bulkDuplicateRecords } from "features/apiClient/commands/multiView/bulkDuplicateRecords.command";

export type RecordSelectionAction = "select" | "unselect";

// TODO: update the name
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

  const [isSelectAll, setIsSelectAll] = useState(false);

  const selectedRecordsAcrossWorkspaces = useRef<{
    [contextId: string]:
      | undefined
      | {
          recordIds: Set<string>;
          isAllRecordsSelected: boolean;
        };
  } | null>(null);

  useEffect(() => {
    if (!selectedRecordsAcrossWorkspaces.current) {
      selectedRecordsAcrossWorkspaces.current = {};
    }

    selectedWorkspaces.forEach((workspaceStore) => {
      const prevState = selectedRecordsAcrossWorkspaces.current[workspaceStore.getState()?.id];
      if (!prevState) {
        selectedRecordsAcrossWorkspaces.current[workspaceStore.getState()?.id] = {
          recordIds: new Set(),
          isAllRecordsSelected: false,
        };
      }
    });
  }, [selectedWorkspaces]);

  const handleRecordSelection = useCallback(
    (params: {
      contextId: string;
      action: RecordSelectionAction;
      recordIds: Set<string>;
      isAllRecordsSelected: boolean;
    }) => {
      const { contextId, action, recordIds, isAllRecordsSelected } = params;

      if (!selectedRecordsAcrossWorkspaces.current) {
        selectedRecordsAcrossWorkspaces.current = {};
      }

      if (!selectedRecordsAcrossWorkspaces.current[contextId]) {
        selectedRecordsAcrossWorkspaces.current[contextId] = {
          recordIds: new Set(),
          isAllRecordsSelected: false,
        };
      }

      selectedRecordsAcrossWorkspaces.current[contextId].isAllRecordsSelected = isAllRecordsSelected;
      if (action === "select") {
        recordIds.forEach((id) => {
          selectedRecordsAcrossWorkspaces.current[contextId].recordIds.add(id);
        });
      } else {
        recordIds.forEach((id) => {
          selectedRecordsAcrossWorkspaces.current[contextId].recordIds.delete(id);
        });
      }

      const isAll = Object.values(selectedRecordsAcrossWorkspaces.current ?? {}).every((value) => {
        return value.isAllRecordsSelected;
      });

      setIsAllRecordsSelected(isAll);
    },
    []
  );

  const handleSelectToggle = useCallback(() => {
    if (isSelectAll) {
      selectedRecordsAcrossWorkspaces.current = null;
      setIsSelectAll(false);
      setIsAllRecordsSelected(false);
    } else {
      setIsSelectAll(true);
    }
  }, [isSelectAll]);

  const duplicateRecords = useCallback(async () => {
    const promises = Object.entries(selectedRecordsAcrossWorkspaces.current).map(([ctxId, value]) => {
      return bulkDuplicateRecords(ctxId, value.recordIds);
    });

    // TODO: TBD, what to do in partial fail cases?
    return await Promise.all(promises);
  }, []);

  const onBulkActionClick = useCallback(
    (action: BulkActions) => {
      if (action === BulkActions.SELECT_ALL) {
        handleSelectToggle();
        return;
      }

      if (action === BulkActions.DUPLICATE) {
        duplicateRecords();
      }

      if (action === BulkActions.DELETE) {
        // NOOP
      }

      if ([BulkActions.MOVE, BulkActions.EXPORT].includes(action)) {
        const isRecordsSelectedAcrossWorkspaces = Object.keys(selectedRecordsAcrossWorkspaces ?? {}).length > 1;

        if (isRecordsSelectedAcrossWorkspaces) {
          toast.error(`${capitalize(action)} not supported across workspaces!`);
          return;
        }
      }
    },
    [handleSelectToggle, duplicateRecords]
  );

  const toggleMultiSelect = useCallback(() => {
    if (showSelection) {
      setShowSelection(false);
      selectedRecordsAcrossWorkspaces.current = null;
      setIsSelectAll(false);
      setIsAllRecordsSelected(false);
    } else {
      setShowSelection(true);
    }
  }, [showSelection]);

  const handleShowSelection = useCallback((value: boolean) => {
    setShowSelection(value);
  }, []);

  const multiSelectOptions = useMemo(() => {
    return {
      toggleMultiSelect,
      showMultiSelect: isValidPermission,
    };
  }, [toggleMultiSelect, isValidPermission]);

  return (
    <>
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
              bulkActionsHandler={onBulkActionClick}
            />
          )}
        </div>

        {selectedWorkspaces.map((workspace) => {
          const workspaceId = workspace.getState().id;

          return (
            <WorkspaceLoader key={workspaceId} workspaceId={workspaceId}>
              <ContextId id={getContext(workspaceId)?.id}>
                <h3>Workspace: {workspace.getState().name}</h3>
                <CollectionsList
                  isSelectAll={isSelectAll}
                  showSelection={showSelection}
                  handleShowSelection={handleShowSelection}
                  searchValue={searchValue}
                  onNewClick={onNewClick}
                  recordTypeToBeCreated={recordTypeToBeCreated}
                  handleRecordSelection={handleRecordSelection}
                />
              </ContextId>
            </WorkspaceLoader>
          );
        })}
      </DndProvider>
    </>
  );
};
