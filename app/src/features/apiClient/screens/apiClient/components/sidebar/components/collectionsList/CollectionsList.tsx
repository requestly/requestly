import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { BulkActions, RQAPI } from "features/apiClient/types";
import { notification } from "antd";
import { useApiClientContext } from "features/apiClient/contexts";
import { CollectionRow, ExportType, DraggableApiRecord } from "./collectionRow/CollectionRow";
import { RequestRow } from "./requestRow/RequestRow";
import { useDrop } from "react-dnd";
import { useCommand } from "features/apiClient/commands";
import {
  convertFlatRecordsToNestedRecords,
  isApiCollection,
  isApiRequest,
  filterRecordsBySearch,
  getRecordIdsToBeExpanded,
  filterOutChildrenRecords,
  processRecordsForDuplication,
} from "../../../../utils";
import { ApiRecordEmptyState } from "./apiRecordEmptyState/ApiRecordEmptyState";
import { SidebarPlaceholderItem } from "../SidebarPlaceholderItem/SidebarPlaceholderItem";
import { sessionStorage } from "utils/sessionStorage";
import { SidebarListHeader } from "../sidebarListHeader/SidebarListHeader";
import "./collectionsList.scss";
import { head, isEmpty, union } from "lodash";
import { SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY } from "features/apiClient/constants";
import { ApiClientExportModal } from "../../../modals/exportModal/ApiClientExportModal";
import { PostmanExportModal } from "../../../modals/postmanCollectionExportModal/PostmanCollectionExportModal";
import { toast } from "utils/Toast";
import { MoveToCollectionModal } from "../../../modals/MoveToCollectionModal/MoveToCollectionModal";
import ActionMenu from "./BulkActionsMenu";
import { useRBAC } from "features/rbac";
import * as Sentry from "@sentry/react";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { EXPANDED_RECORD_IDS_UPDATED } from "features/apiClient/exampleCollections/store";
import { ExampleCollectionsNudge } from "../ExampleCollectionsNudge/ExampleCollectionsNudge";
import { useNewApiClientContext } from "features/apiClient/hooks/useNewApiClientContext";
import { useApiClientRepository } from "features/apiClient/contexts/meta";

interface Props {
  onNewClick: (src: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType) => Promise<void>;
  recordTypeToBeCreated: RQAPI.RecordType | null;
  handleRecordsToBeDeleted: (records: RQAPI.ApiClientRecord[]) => void;
}

export const CollectionsList: React.FC<Props> = ({ onNewClick, recordTypeToBeCreated, handleRecordsToBeDeleted }) => {
  const { collectionId, requestId } = useParams();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const [apiClientRecords] = useAPIRecords((state) => [state.apiClientRecords]);
  const { isRecordBeingCreated } = useApiClientContext();
  const { onSaveRecord, onSaveBulkRecords } = useNewApiClientContext();

  const { apiClientRecordsRepository } = useApiClientRepository();
  const {
    api: { moveRecords },
  } = useCommand();

  const [collectionsToExport, setCollectionsToExport] = useState<RQAPI.ApiClientRecord[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPostmanExportModalOpen, setIsPostmanExportModalOpen] = useState(false);
  const [showSelection, setShowSelection] = useState(false);
  const [isMoveCollectionModalOpen, setIsMoveCollectionModalOpen] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<RQAPI.ApiClientRecord["id"]>>(new Set());
  const [expandedRecordIds, setExpandedRecordIds] = useState(
    sessionStorage.getItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, [])
  );
  const [searchValue, setSearchValue] = useState("");
  const [isAllRecordsSelected, setIsAllRecordsSelected] = useState(false);

  const [childParentMap] = useAPIRecords((state) => [state.childParentMap]);

  useEffect(() => {
    const handleUpdates = () => {
      setExpandedRecordIds(sessionStorage.getItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, []));
    };

    window.addEventListener(EXPANDED_RECORD_IDS_UPDATED, handleUpdates);
    return () => {
      window.removeEventListener(EXPANDED_RECORD_IDS_UPDATED, handleUpdates);
    };
  }, []);

  const prepareRecordsToRender = useCallback((records: RQAPI.ApiClientRecord[]) => {
    const { updatedRecords, recordsMap } = convertFlatRecordsToNestedRecords(records);
    setShowSelection(false);

    updatedRecords.sort((recordA, recordB) => {
      // If different type, then keep collection first
      if (recordA.type === RQAPI.RecordType.COLLECTION && recordA.isExample && !recordB.isExample) {
        return -1;
      }

      if (recordB.type === RQAPI.RecordType.COLLECTION && recordB.isExample && !recordA.isExample) {
        return 1;
      }

      if (recordA.type !== recordB.type) {
        return recordA.type === RQAPI.RecordType.COLLECTION ? -1 : 1;
      }

      // If types are the same, sort lexicographically by name
      if (recordA.name.toLowerCase() !== recordB.name.toLowerCase()) {
        return recordA.name.toLowerCase() < recordB.name.toLowerCase() ? -1 : 1;
      }

      // If names are the same, sort by creation date
      return recordA.createdTs - recordB.createdTs;
    });

    return {
      count: updatedRecords.length,
      collections: updatedRecords.filter((record) => isApiCollection(record)) as RQAPI.CollectionRecord[],
      requests: updatedRecords.filter((record) => isApiRequest(record)) as RQAPI.ApiRecord[],
      recordsMap: recordsMap,
    };
  }, []);

  const updatedRecords = useMemo(() => {
    const filteredRecords = filterRecordsBySearch(apiClientRecords, searchValue);
    const recordsToRender = prepareRecordsToRender(filteredRecords);

    if (searchValue) {
      const recordsToExpand: string[] = [];
      filteredRecords.forEach((record) => {
        if (record.collectionId) {
          recordsToExpand.push(record.collectionId);
          let parentId = childParentMap.get(record.collectionId);
          while (parentId) {
            recordsToExpand.push(parentId);
            parentId = childParentMap.get(parentId);
          }
        }
      });
      setExpandedRecordIds((prev: string[]) => {
        const newExpanded = prev.concat(recordsToExpand);
        return newExpanded;
      });
    }
    return recordsToRender;
  }, [apiClientRecords, childParentMap, prepareRecordsToRender, searchValue]);

  const handleExportCollection = useCallback((collection: RQAPI.CollectionRecord, exportType: ExportType) => {
    setCollectionsToExport((prev) => [...prev, collection]);

    switch (exportType) {
      case ExportType.REQUESTLY:
        setIsExportModalOpen(true);
        break;
      case ExportType.POSTMAN:
        setIsPostmanExportModalOpen(true);
        break;
      default:
        console.warn(`Unknown export type: ${exportType}`);
    }
  }, []);

  const toggleSelection = useCallback(() => {
    setSelectedRecords(new Set());
    setShowSelection((prev) => !prev);
    setIsAllRecordsSelected(false);
  }, [setSelectedRecords, setShowSelection]);

  const multiSelectOptions = {
    showMultiSelect: isValidPermission,
    toggleMultiSelect: toggleSelection,
  };

  const addNestedCollection = useCallback(
    (record: RQAPI.CollectionRecord, newSelectedRecords: Set<RQAPI.ApiClientRecord["id"]>) => {
      newSelectedRecords.add(record.id);
      if (record.data.children) {
        record.data.children.forEach((child) => {
          if (child.type === "collection") {
            addNestedCollection(child, newSelectedRecords);
          } else {
            newSelectedRecords.add(child.id);
          }
        });
      }
    },
    []
  );

  const bulkActionHandler = useCallback(
    async (action: BulkActions) => {
      if (isEmpty(selectedRecords) && action !== BulkActions.SELECT_ALL) {
        toast.error("Please Select Records");
        return;
      }

      const processedRecords = filterOutChildrenRecords(selectedRecords, childParentMap, updatedRecords.recordsMap);
      switch (action) {
        case BulkActions.DUPLICATE: {
          const recordsToDuplicate = processRecordsForDuplication(processedRecords, apiClientRecordsRepository);

          try {
            const result = await apiClientRecordsRepository.duplicateApiEntities(recordsToDuplicate);

            toast.success("Records Duplicated successfully");
            result.length === 1 ? onSaveRecord(head(result)!, "open") : onSaveBulkRecords(result);
          } catch (error) {
            console.error("Error Duplicating records: ", error);
            notification.error({
              message: "Failed to duplicate some records",
              description: error?.message,
              placement: "bottomRight",
            });
            Sentry.withScope((scope) => {
              scope.setTag("error_type", "api_client_record_duplication");
              Sentry.captureException(error);
            });
          }

          break;
        }

        case BulkActions.DELETE:
          handleRecordsToBeDeleted(processedRecords);
          break;

        case BulkActions.EXPORT:
          // This case is now deprecated, handled by specific export actions
          break;

        case BulkActions.EXPORT_REQUESTLY:
          setIsExportModalOpen(true);
          setCollectionsToExport(processedRecords);
          break;

        case BulkActions.EXPORT_POSTMAN:
          setIsPostmanExportModalOpen(true);
          setCollectionsToExport(processedRecords);
          break;

        case BulkActions.MOVE:
          setIsMoveCollectionModalOpen(true);
          break;

        case BulkActions.SELECT_ALL:
          setIsAllRecordsSelected((prev) => !prev);
          if (isAllRecordsSelected) {
            setSelectedRecords(new Set());
          } else {
            const newSelectedRecords: Set<RQAPI.ApiClientRecord["id"]> = new Set();
            updatedRecords.collections.forEach((record) => {
              addNestedCollection(record, newSelectedRecords);
            });
            updatedRecords.requests.forEach((record) => {
              newSelectedRecords.add(record.id);
            });
            setSelectedRecords(newSelectedRecords);
          }
          break;

        default:
          break;
      }
    },
    [
      selectedRecords,
      childParentMap,
      updatedRecords.recordsMap,
      updatedRecords.collections,
      updatedRecords.requests,
      handleRecordsToBeDeleted,
      isAllRecordsSelected,
      apiClientRecordsRepository,
      onSaveRecord,
      onSaveBulkRecords,
      addNestedCollection,
    ]
  );

  const handleRecordToggle = useCallback(
    (record: RQAPI.ApiClientRecord, isChecked: boolean) => {
      const updateSelection = (
        record: RQAPI.ApiClientRecord,
        checked: boolean,
        newSelectedRecords: Set<RQAPI.ApiClientRecord["id"]>
      ) => {
        const queue = [record];
        while (queue.length) {
          const current = queue.pop();
          if (checked && current) {
            newSelectedRecords.add(current.id);
          } else if (current) {
            newSelectedRecords.delete(current.id);
          }

          if (current && isApiCollection(current) && current.data.children) {
            queue.push(...current.data.children);
          }
        }
      };

      const checkParentSelection = (
        recordId: RQAPI.ApiClientRecord["id"],
        checked: boolean,
        newSelectedRecords: Set<RQAPI.ApiClientRecord["id"]>
      ) => {
        const { recordsMap } = updatedRecords;
        let parentId = childParentMap.get(recordId);
        while (parentId) {
          const parentRecord = recordsMap[parentId];
          if (!parentRecord || !isApiCollection(parentRecord)) break;

          const allChildrenSelected = parentRecord.data.children?.every((child) => newSelectedRecords.has(child.id));
          if (checked && allChildrenSelected) {
            newSelectedRecords.add(parentId);
          } else if (!checked && parentRecord.data.children?.some((child) => !newSelectedRecords.has(child.id))) {
            newSelectedRecords.delete(parentId);
          }
          parentId = childParentMap.get(parentId);
        }
      };

      let newSelection = new Set();

      setSelectedRecords((prevSelected) => {
        let newSelectedRecords = new Set(prevSelected);
        updateSelection(record, isChecked, newSelectedRecords);
        record.collectionId && checkParentSelection(record.id, isChecked, newSelectedRecords);
        newSelection = newSelectedRecords;
        return newSelectedRecords;
      });

      const totalRecordsCount = updatedRecords.collections.length + updatedRecords.requests.length;
      setIsAllRecordsSelected(newSelection.size === totalRecordsCount);
    },
    [updatedRecords, childParentMap]
  );

  const recordsSelectionHandler = useCallback(
    (record: RQAPI.ApiClientRecord, event: React.ChangeEvent<HTMLInputElement>) => {
      handleRecordToggle(record, event.target.checked);
    },
    [handleRecordToggle]
  );

  const handleItemClick = useCallback(
    (record: RQAPI.ApiClientRecord, event: React.MouseEvent) => {
      if (event.metaKey || event.ctrlKey) {
        event.preventDefault();
        event.stopPropagation();

        if (!showSelection) {
          setShowSelection(true);
        }
        handleRecordToggle(record, !selectedRecords.has(record.id));
      }
    },
    [showSelection, selectedRecords, handleRecordToggle]
  );

  useEffect(() => {
    const id = requestId || collectionId;
    if (id) {
      setExpandedRecordIds((prev: RQAPI.ApiClientRecord["id"][]) =>
        union(prev, getRecordIdsToBeExpanded(id, prev, apiClientRecords))
      );
    }
  }, [collectionId, requestId, apiClientRecords]);

  const handleDropToRoot = useCallback(
    async (item: DraggableApiRecord) => {
      try {
        await moveRecords({
          collectionId: "",
          recordsToMove: [item.record],
        });

        toast.success(`Moved "${item.record.name}" to workspace root`);
      } catch (error) {
        toast.error((error as any)?.message || "Failed to move item. Please try again.");
      }
    },
    [moveRecords]
  );

  // Shared drop configuration for all drop zones
  const dropConfig = useMemo(
    () => ({
      accept: [RQAPI.RecordType.API, RQAPI.RecordType.COLLECTION],
      drop: (item: DraggableApiRecord, monitor: any) => {
        if (!monitor.isOver({ shallow: true })) return;
        handleDropToRoot(item);
      },
      canDrop: (item: DraggableApiRecord) => {
        return Boolean(item.record.collectionId);
      },
    }),
    [handleDropToRoot]
  );

  // Background drop zone (entire content area)
  const [, dropBackground] = useDrop(() => dropConfig, [dropConfig]);

  // Top drop zone with hover indicator
  const [{ isOverTopLevel }, dropTopLevel] = useDrop(
    () => ({
      ...dropConfig,
      collect: (monitor) => ({
        isOverTopLevel: monitor.isOver({ shallow: true }) && monitor.canDrop(),
      }),
    }),
    [dropConfig]
  );

  // Bottom drop zone with hover indicator
  const [{ isOverBottomLevel }, dropBottomLevel] = useDrop(
    () => ({
      ...dropConfig,
      collect: (monitor) => ({
        isOverBottomLevel: monitor.isOver({ shallow: true }) && monitor.canDrop(),
      }),
    }),
    [dropConfig]
  );

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
            toggleSelection={toggleSelection}
            bulkActionsHandler={bulkActionHandler}
          />
        )}
      </div>
      <div className={`collections-list-container ${showSelection ? "selection-enabled" : ""}`}>
        <div ref={dropBackground} className="collections-list-content">
          <div ref={dropTopLevel} className={`top-level-drop-zone ${isOverTopLevel ? "active" : ""}`} />
          <ExampleCollectionsNudge />
          {updatedRecords.count > 0 ? (
            <div className="collections-list">
              {updatedRecords.collections.map((record) => {
                return (
                  <CollectionRow
                    isReadOnly={!isValidPermission}
                    key={record.id}
                    record={record}
                    onNewClick={onNewClick}
                    expandedRecordIds={expandedRecordIds}
                    setExpandedRecordIds={setExpandedRecordIds}
                    handleRecordsToBeDeleted={handleRecordsToBeDeleted}
                    onRequestlyExportClick={handleExportCollection}
                    onItemClick={handleItemClick}
                    bulkActionOptions={{ showSelection, selectedRecords, recordsSelectionHandler, setShowSelection }}
                  />
                );
              })}

              {isRecordBeingCreated === RQAPI.RecordType.COLLECTION &&
                recordTypeToBeCreated === RQAPI.RecordType.COLLECTION && (
                  <div style={{ margin: "8px 0" }}>
                    <SidebarPlaceholderItem name="New Collection" />
                  </div>
                )}

              {updatedRecords.requests.map((record) => {
                return (
                  <RequestRow
                    key={record.id}
                    record={record}
                    isReadOnly={!isValidPermission}
                    handleRecordsToBeDeleted={handleRecordsToBeDeleted}
                    onItemClick={handleItemClick}
                    bulkActionOptions={{ showSelection, selectedRecords, recordsSelectionHandler, setShowSelection }}
                  />
                );
              })}

              {isRecordBeingCreated === RQAPI.RecordType.API && recordTypeToBeCreated === RQAPI.RecordType.API && (
                <div className="mt-8">
                  <SidebarPlaceholderItem name="New Request" />
                </div>
              )}

              <div ref={dropBottomLevel} className={`bottom-level-drop-zone ${isOverBottomLevel ? "active" : ""}`} />
            </div>
          ) : (
            <ApiRecordEmptyState
              disabled={!isValidPermission}
              newRecordBtnText="Create a collection"
              message={searchValue ? "No collection or request found" : "No content available yet"}
              onNewClick={onNewClick}
            />
          )}
        </div>
      </div>

      {isExportModalOpen && (
        <ApiClientExportModal
          exportType="collection"
          recordsToBeExported={collectionsToExport}
          isOpen={isExportModalOpen}
          onClose={() => {
            setCollectionsToExport([]);
            setIsExportModalOpen(false);
          }}
        />
      )}

      {isPostmanExportModalOpen && (
        <PostmanExportModal
          recordsToBeExported={collectionsToExport}
          isOpen={isPostmanExportModalOpen}
          onClose={() => {
            setCollectionsToExport([]);
            setIsPostmanExportModalOpen(false);
          }}
        />
      )}

      {isMoveCollectionModalOpen && (
        <MoveToCollectionModal
          recordsToMove={filterOutChildrenRecords(selectedRecords, childParentMap, updatedRecords.recordsMap)}
          isOpen={isMoveCollectionModalOpen}
          onClose={() => {
            setIsMoveCollectionModalOpen(false);
          }}
        />
      )}
      {/* <MultiSelectNudge /> */}
    </>
  );
};
