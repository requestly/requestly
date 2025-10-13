import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useApiClientMultiWorkspaceView } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { BulkActions, RQAPI } from "features/apiClient/types";
import { useRBAC } from "features/rbac";
import { SidebarListHeader } from "../../components/sidebarListHeader/SidebarListHeader";
import { ContextId } from "features/apiClient/contexts/contextId.context";
import { WorkspaceProvider } from "../WorkspaceProvider/WorkspaceProvider";
import ActionMenu, { ActionMenuProps } from "../../components/collectionsList/BulkActionsMenu";
import { toast } from "utils/Toast";
import {
  ApiClientFeatureContext,
  apiClientFeatureContextProviderStore,
} from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { MoveToCollectionModal } from "../../../modals/MoveToCollectionModal/MoveToCollectionModal";
import { getProcessedRecords } from "features/apiClient/commands/utils";
import { getApiClientFeatureContext } from "features/apiClient/commands/store.utils";
import { duplicateRecords } from "features/apiClient/commands/records/duplicateRecords.command";
import { ApiClientExportModal } from "../../../modals/exportModal/ApiClientExportModal";
import { captureException } from "backend/apiClient/utils";
import { DeleteApiRecordModal } from "../../../modals";
import { ContextualCollectionsList } from "./CollectionsList/ContextualCollectionsList";
import { PostmanExportModal } from "../../../modals/postmanCollectionExportModal/PostmanCollectionExportModal";
import "./contextualCollectionsSidebar.scss";

export const ContextualCollectionsSidebar: React.FC<{
  onNewClick: (src: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType) => Promise<void>;
  recordTypeToBeCreated: RQAPI.RecordType | null;
}> = ({ onNewClick, recordTypeToBeCreated }) => {
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const selectedWorkspaces = useApiClientMultiWorkspaceView((s) => s.selectedWorkspaces);

  const [searchValue, setSearchValue] = useState("");
  const [showSelection, setShowSelection] = useState(false);
  const [isAllRecordsSelected, setIsAllRecordsSelected] = useState(false);
  const [isSelectionAcrossWorkspaces, setIsSelectionAcrossWorkspaces] = useState(false);

  const [selectAll, setSelectAll] = useState({ value: false, takeAction: false });
  const [isMoveCollectionModalOpen, setIsMoveCollectionModalOpen] = useState(false);

  const [selectedRecordsInSingleContext, setSelectedRecordsInSingleContext] = useState<
    [string | undefined, RQAPI.ApiClientRecord[]]
  >([undefined, []]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPostmanExportModalOpen, setIsPostmanExportModalOpen] = useState(false);

  const [recordsToBeDeleted, setRecordsToBeDeleted] = useState<{
    records: RQAPI.ApiClientRecord[];
    context: ApiClientFeatureContext;
  } | null>({ context: null, records: [] });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleRecordsToBeDeleted = useCallback((records: RQAPI.ApiClientRecord[], context: ApiClientFeatureContext) => {
    setRecordsToBeDeleted({ context, records });
    setIsDeleteModalOpen(true);
  }, []);

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
    (params: { contextId: string; recordIds?: Set<string>; isAllRecordsSelected?: boolean }) => {
      const { contextId, recordIds = new Set(), isAllRecordsSelected = false } = params;

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

      selectedRecordsAcrossWorkspaces.current[contextId].recordIds = recordIds;

      const isAll = Object.values(selectedRecordsAcrossWorkspaces.current ?? {}).every((value) => {
        return value.isAllRecordsSelected;
      });

      setIsAllRecordsSelected(isAll);
      setSelectAll({ value: isAll, takeAction: false });

      const workspacesCountWithSelectedRecords = Object.values(selectedRecordsAcrossWorkspaces.current ?? {}).filter(
        (value) => value.recordIds.size > 0
      ).length;

      setIsSelectionAcrossWorkspaces(workspacesCountWithSelectedRecords > 1);
    },
    []
  );

  const deselect = useCallback(() => {
    selectedRecordsAcrossWorkspaces.current = null;
    setSelectAll({ value: false, takeAction: true });
    setIsAllRecordsSelected(false);
    setIsSelectionAcrossWorkspaces(false);
  }, []);

  const handleSelectAllToggle = useCallback(() => {
    deselect();
    setSelectAll({ value: !selectAll.value, takeAction: true });
  }, [selectAll, deselect]);

  const handleDuplicateRecords = useCallback(async () => {
    try {
      const promises = Object.entries(selectedRecordsAcrossWorkspaces.current).map(([ctxId, value]) => {
        const context = getApiClientFeatureContext(ctxId);
        return duplicateRecords(context, { recordIds: value.recordIds });
      });

      // TODO: TBD, what to do in partial fail cases?
      await Promise.all(promises);
      deselect();
    } catch (error) {
      captureException(error);
    }
  }, [deselect]);

  const handleRecordsDelete = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, [setIsDeleteModalOpen]);

  const getSelectedRecordsInSingleContext: () => [string | undefined, RQAPI.ApiClientRecord[]] = useCallback(() => {
    const workspacesWithSelectedRecords = Object.entries(selectedRecordsAcrossWorkspaces.current ?? {}).filter(
      ([ctxId, value]) => value.recordIds.size > 0
    );

    if (workspacesWithSelectedRecords.length === 1) {
      const [ctxId, value] = workspacesWithSelectedRecords[0];
      return [ctxId, getProcessedRecords(ctxId, value.recordIds)];
    }

    return [undefined, []];
  }, []);

  const onBulkActionClick = useCallback(
    (action: BulkActions) => {
      const isEmpty = Object.values(selectedRecordsAcrossWorkspaces.current ?? {}).every(
        (value) => value.recordIds.size === 0
      );

      if (isEmpty && action !== BulkActions.SELECT_ALL) {
        toast.error("Please Select Records");
        return;
      }

      if (action === BulkActions.SELECT_ALL) {
        handleSelectAllToggle();
        return;
      }

      if (action === BulkActions.DUPLICATE) {
        handleDuplicateRecords();
        return;
      }

      if (action === BulkActions.DELETE) {
        handleRecordsDelete();
        return;
      }

      if (action === BulkActions.MOVE) {
        setSelectedRecordsInSingleContext(getSelectedRecordsInSingleContext());
        setIsMoveCollectionModalOpen(true);
        return;
      }

      if (action === BulkActions.EXPORT_REQUESTLY) {
        setSelectedRecordsInSingleContext(getSelectedRecordsInSingleContext());
        setIsExportModalOpen(true);
        return;
      }

      if (action === BulkActions.EXPORT_POSTMAN) {
        setSelectedRecordsInSingleContext(getSelectedRecordsInSingleContext());
        setIsPostmanExportModalOpen(true);
        return;
      }
    },
    [handleSelectAllToggle, handleRecordsDelete, handleDuplicateRecords, getSelectedRecordsInSingleContext]
  );

  const toggleMultiSelect = useCallback(() => {
    deselect();

    if (showSelection) {
      setShowSelection(false);
    } else {
      setShowSelection(true);
    }
  }, [showSelection, deselect]);

  const onExportModalClose = useCallback(() => {
    deselect();
    toggleMultiSelect();
  }, [deselect, toggleMultiSelect]);

  const onDeleteModalClose = useCallback(() => {
    deselect();
    setRecordsToBeDeleted(null);
    setIsDeleteModalOpen(false);
  }, [deselect]);

  const handleShowSelection = useCallback((value: boolean) => {
    setShowSelection(value);
  }, []);

  const multiSelectOptions = useMemo(() => {
    return {
      toggleMultiSelect,
      showMultiSelect: isValidPermission,
    };
  }, [toggleMultiSelect, isValidPermission]);

  const getSelectedRecords = useCallback((): {
    context: ApiClientFeatureContext | undefined;
    records: RQAPI.ApiClientRecord[];
  }[] => {
    const recordsWithContext = Object.entries(selectedRecordsAcrossWorkspaces.current ?? {}).map(([ctxId, value]) => {
      const context = apiClientFeatureContextProviderStore.getState().getContext(ctxId);
      return {
        context,
        // TODO: check why some records are undefind
        records: getProcessedRecords(ctxId, value.recordIds).filter((r) => !!r),
      };
    });

    return showSelection ? recordsWithContext : [recordsToBeDeleted];
  }, [showSelection, recordsToBeDeleted]);

  const disabledActions: ActionMenuProps["disabledActions"] = useMemo(() => {
    return {
      [BulkActions.MOVE]: {
        value: isSelectionAcrossWorkspaces,
        tooltip: "You can only move items within the same workspace.",
      },
      [BulkActions.EXPORT]: {
        value: isSelectionAcrossWorkspaces,
        tooltip: "You can only export requests from a single workspace.",
      },
    };
  }, [isSelectionAcrossWorkspaces]);

  return (
    <>
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
            disabledActions={disabledActions}
          />
        )}
      </div>

      <div className="multi-view-collections-sidebar">
        {selectedWorkspaces.map((workspace) => {
          const workspaceId = workspace.getState().id;

          return (
            <WorkspaceProvider key={workspaceId} workspaceId={workspaceId}>
              <ContextualCollectionsList
                selectAll={selectAll}
                showSelection={showSelection}
                handleShowSelection={handleShowSelection}
                searchValue={searchValue}
                onNewClick={onNewClick}
                recordTypeToBeCreated={recordTypeToBeCreated}
                handleRecordSelection={handleRecordSelection}
                handleRecordsToBeDeleted={handleRecordsToBeDeleted}
              />
            </WorkspaceProvider>
          );
        })}
      </div>

      {isMoveCollectionModalOpen ? (
        // TODO: TBD on modals
        <ContextId id={selectedRecordsInSingleContext[0]}>
          <MoveToCollectionModal
            isBulkActionMode={showSelection}
            recordsToMove={selectedRecordsInSingleContext[1]}
            isOpen={isMoveCollectionModalOpen}
            onClose={() => {
              setIsMoveCollectionModalOpen(false);
            }}
          />
        </ContextId>
      ) : null}

      {isExportModalOpen ? (
        <ApiClientExportModal
          exportType="collection"
          recordsToBeExported={selectedRecordsInSingleContext[1]}
          isOpen={isExportModalOpen}
          onClose={() => {
            onExportModalClose();
            setIsExportModalOpen(false);
          }}
        />
      ) : null}

      {isPostmanExportModalOpen ? (
        <PostmanExportModal
          recordsToBeExported={selectedRecordsInSingleContext[1]}
          isOpen={isPostmanExportModalOpen}
          onClose={() => {
            onExportModalClose();
            setIsPostmanExportModalOpen(false);
          }}
        />
      ) : null}

      {isDeleteModalOpen ? (
        <DeleteApiRecordModal
          open={isDeleteModalOpen}
          getRecordsToDelete={getSelectedRecords}
          onClose={onDeleteModalClose}
        />
      ) : null}
    </>
  );
};
