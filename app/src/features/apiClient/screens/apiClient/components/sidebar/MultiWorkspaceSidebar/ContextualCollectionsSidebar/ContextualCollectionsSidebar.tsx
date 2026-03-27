import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGetAllSelectedWorkspaces } from "features/apiClient/slices/workspaceView/hooks";
import { BulkActions, RQAPI } from "features/apiClient/types";
import { useRBAC } from "features/rbac";
import { SidebarListHeader } from "../../components/sidebarListHeader/SidebarListHeader";
import ActionMenu, { ActionMenuProps } from "../../components/collectionsList/BulkActionsMenu";
import { toast } from "utils/Toast";
import { MoveToCollectionModal } from "../../../modals/MoveToCollectionModal/MoveToCollectionModal";
import { getProcessedRecords } from "features/apiClient/commands/utils";
import {
  ApiClientFeatureContext,
  duplicateRecords,
  getApiClientFeatureContext,
  WorkspaceInfo,
} from "features/apiClient/slices";
import { ApiClientExportModal } from "../../../modals/exportModal/ApiClientExportModal";
import { DeleteApiRecordModal } from "../../../modals";
import { ContextualCollectionsList } from "./CollectionsList/ContextualCollectionsList";
import { PostmanExportModal } from "../../../modals/postmanCollectionExportModal/PostmanCollectionExportModal";
import { WorkspaceProvider } from "../WorkspaceProvider/WorkspaceProvider";
import { WorkspaceIdContextProvider } from "features/apiClient/common/WorkspaceProvider";
import "./contextualCollectionsSidebar.scss";
import { ErrorSeverity } from "errors/types";
import { NativeError } from "errors/NativeError";

export const ContextualCollectionsSidebar: React.FC<{
  onNewClick: (src: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType) => Promise<void>;
  recordTypeToBeCreated: RQAPI.RecordType | null;
}> = ({ onNewClick, recordTypeToBeCreated }) => {
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const selectedWorkspaces = useGetAllSelectedWorkspaces();

  const [searchValue, setSearchValue] = useState("");
  const [showSelection, setShowSelection] = useState(false);
  const [isAllRecordsSelected, setIsAllRecordsSelected] = useState(false);
  const [isSelectionAcrossWorkspaces, setIsSelectionAcrossWorkspaces] = useState(false);

  const [selectAll, setSelectAll] = useState({ value: false, takeAction: false });
  const [isMoveCollectionModalOpen, setIsMoveCollectionModalOpen] = useState(false);

  const [selectedRecordsInSingleContext, setSelectedRecordsInSingleContext] = useState<
    [WorkspaceInfo["id"], RQAPI.ApiClientRecord[]]
  >([null, []]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPostmanExportModalOpen, setIsPostmanExportModalOpen] = useState(false);

  const [recordsToBeDeleted, setRecordsToBeDeleted] = useState<{
    records: RQAPI.ApiClientRecord[];
    context: ApiClientFeatureContext | undefined;
  }>({ context: undefined, records: [] });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleRecordsToBeDeleted = useCallback((records: RQAPI.ApiClientRecord[], context: ApiClientFeatureContext) => {
    setRecordsToBeDeleted({ context, records });
    setIsDeleteModalOpen(true);
  }, []);

  const selectedRecordsAcrossWorkspaces = useRef<{
    [key: WorkspaceInfo["id"]]: { recordIds: Set<string>; isAllRecordsSelected: boolean };
  }>({});

  useEffect(() => {
    if (!selectedRecordsAcrossWorkspaces.current) {
      selectedRecordsAcrossWorkspaces.current = {};
    }

    selectedWorkspaces.forEach((workspace) => {
      const prevState = selectedRecordsAcrossWorkspaces.current[workspace.id];
      if (!prevState) {
        selectedRecordsAcrossWorkspaces.current[workspace.id] = {
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
        return value?.isAllRecordsSelected;
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
    selectedRecordsAcrossWorkspaces.current = {};
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
      const promises = Object.entries(selectedRecordsAcrossWorkspaces.current).map(async ([ctxId, value]) => {
        const context = getApiClientFeatureContext(ctxId);
        return context.store
          .dispatch(
            duplicateRecords({
              recordIds: value?.recordIds,
              repository: context.repositories.apiClientRecordsRepository,
            }) as any
          )
          .unwrap();
      });

      // TODO: TBD, what to do in partial fail cases?
      await Promise.all(promises);
      deselect();
    } catch (error) {
      throw NativeError.fromError(error).setShowBoundary(true).setSeverity(ErrorSeverity.ERROR);
    }
  }, [deselect]);

  const handleRecordsDelete = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, [setIsDeleteModalOpen]);

  const getSelectedRecordsInSingleContext: () => [WorkspaceInfo["id"], RQAPI.ApiClientRecord[]] = useCallback(() => {
    const workspacesWithSelectedRecords = Object.entries(selectedRecordsAcrossWorkspaces.current ?? {}).filter(
      ([ctxId, value]) => value.recordIds.size > 0
    );

    if (workspacesWithSelectedRecords.length === 1) {
      const [ctxId, value] = workspacesWithSelectedRecords[0];
      return [ctxId, getProcessedRecords(ctxId, value?.recordIds)];
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
    setRecordsToBeDeleted({
      context: undefined,
      records: [],
    });
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
      const context = getApiClientFeatureContext(ctxId);
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
          return (
            <WorkspaceProvider key={workspace.id} workspaceId={workspace.id}>
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
        <WorkspaceIdContextProvider id={selectedRecordsInSingleContext[0] ?? null}>
          <MoveToCollectionModal
            isBulkActionMode={showSelection}
            recordsToMove={selectedRecordsInSingleContext[1]}
            isOpen={isMoveCollectionModalOpen}
            onClose={() => {
              setIsMoveCollectionModalOpen(false);
            }}
          />
        </WorkspaceIdContextProvider>
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
