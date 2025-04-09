import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { BulkActions, RQAPI } from "features/apiClient/types";
import { Typography } from "antd";
import { useApiClientContext } from "features/apiClient/contexts";
import { CollectionRow } from "./collectionRow/CollectionRow";
import { RequestRow } from "./requestRow/RequestRow";
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
import { toast } from "utils/Toast";
import { MoveToCollectionModal } from "../../../modals/MoveToCollectionModal/MoveToCollectionModal";
import ActionMenu from "./BulkActionsMenu";
import { ErrorFilesList } from "../ErrorFilesList/ErrorFileslist";
import { useRBAC } from "features/rbac";
import * as Sentry from "@sentry/react";

interface Props {
  onNewClick: (src: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType) => Promise<void>;
  recordTypeToBeCreated: RQAPI.RecordType;
}

export const CollectionsList: React.FC<Props> = ({ onNewClick, recordTypeToBeCreated }) => {
  const { collectionId, requestId } = useParams();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const {
    isLoadingApiClientRecords,
    apiClientRecords,
    isRecordBeingCreated,
    errorFiles,
    setIsDeleteModalOpen,
    updateRecordsToBeDeleted,
    onSaveRecord,
    onSaveBulkRecords,
    apiClientRecordsRepository,
  } = useApiClientContext();
  const [collectionsToExport, setCollectionsToExport] = useState<RQAPI.Record[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showSelection, setShowSelection] = useState(false);
  const [isMoveCollectionModalOpen, setIsMoveCollectionModalOpen] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<RQAPI.Record["id"]>>(new Set());
  const [expandedRecordIds, setExpandedRecordIds] = useState(
    sessionStorage.getItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, [])
  );
  const [searchValue, setSearchValue] = useState("");
  const [isAllRecordsSelected, setIsAllRecordsSelected] = useState(false);

  const prepareRecordsToRender = useCallback((records: RQAPI.Record[]) => {
    const { updatedRecords, recordsMap } = convertFlatRecordsToNestedRecords(records);
    setShowSelection(false);

    updatedRecords.sort((recordA, recordB) => {
      // If different type, then keep collection first
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

    const childParentMap = records.reduce((collectionIdMap: Record<RQAPI.Record["id"], RQAPI.Record["id"]>, item) => {
      collectionIdMap[item.id] = item.collectionId || "";
      return collectionIdMap;
    }, {});

    return {
      count: updatedRecords.length,
      collections: updatedRecords.filter((record) => isApiCollection(record)) as RQAPI.CollectionRecord[],
      requests: updatedRecords.filter((record) => isApiRequest(record)) as RQAPI.ApiRecord[],
      recordsMap: recordsMap,
      childParentMap,
    };
  }, []);

  const updatedRecords = useMemo(() => {
    const filteredRecords = filterRecordsBySearch(apiClientRecords, searchValue);
    const recordsToRender = prepareRecordsToRender(filteredRecords);
    return recordsToRender;
  }, [apiClientRecords, prepareRecordsToRender, searchValue]);

  const handleExportCollection = useCallback((collection: RQAPI.CollectionRecord) => {
    setCollectionsToExport((prev) => [...prev, collection]);
    setIsExportModalOpen(true);
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
    (record: RQAPI.CollectionRecord, newSelectedRecords: Set<RQAPI.Record["id"]>) => {
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

      const processedRecords = filterOutChildrenRecords(
        selectedRecords,
        updatedRecords.childParentMap,
        updatedRecords.recordsMap
      );
      switch (action) {
        case BulkActions.DUPLICATE: {
          const recordsToDuplicate = processRecordsForDuplication(processedRecords, apiClientRecordsRepository);

          try {
            const result = await apiClientRecordsRepository.duplicateApiEntities(recordsToDuplicate);

            toast.success("Records Duplicated successfully");
            result.length === 1 ? onSaveRecord(head(result), "open") : onSaveBulkRecords(result);
          } catch (error) {
            console.error("Error Duplicating records: ", error);
            toast.error("Failed to duplicate some records");
            Sentry.withScope((scope) => {
              scope.setTag("error_type", "api_client_record_duplication");
              Sentry.captureException(error);
            });
          }

          break;
        }

        case BulkActions.DELETE:
          setIsDeleteModalOpen(true);
          updateRecordsToBeDeleted(processedRecords);
          break;

        case BulkActions.EXPORT:
          setIsExportModalOpen(true);
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
            const newSelectedRecords: Set<RQAPI.Record["id"]> = new Set();
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
      updatedRecords.childParentMap,
      updatedRecords.recordsMap,
      updatedRecords.collections,
      updatedRecords.requests,
      setIsDeleteModalOpen,
      updateRecordsToBeDeleted,
      isAllRecordsSelected,
      apiClientRecordsRepository,
      onSaveRecord,
      onSaveBulkRecords,
      addNestedCollection,
    ]
  );

  // Main toggle handler
  const recordsSelectionHandler = useCallback(
    (record: RQAPI.Record, event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;

      const updateSelection = (record: RQAPI.Record, checked: boolean, newSelectedRecords: Set<RQAPI.Record["id"]>) => {
        const queue = [record];
        while (queue.length) {
          const current = queue.pop();
          if (checked) {
            newSelectedRecords.add(current.id);
          } else {
            newSelectedRecords.delete(current.id);
          }

          if (isApiCollection(current) && current.data.children) {
            queue.push(...current.data.children);
          }
        }
      };

      // Ensure parents are selected/deselected as needed
      const checkParentSelection = (
        recordId: RQAPI.Record["id"],
        checked: boolean,
        newSelectedRecords: Set<RQAPI.Record["id"]>
      ) => {
        const { childParentMap, recordsMap } = updatedRecords;
        let parentId = childParentMap[recordId];
        while (parentId) {
          const parentRecord = recordsMap[parentId];
          if (!parentRecord || !isApiCollection(parentRecord)) break;

          const allChildrenSelected = parentRecord.data.children.every((child) => newSelectedRecords.has(child.id));
          if (checked && allChildrenSelected) {
            newSelectedRecords.add(parentId);
          } else if (!checked && parentRecord.data.children.some((child) => !newSelectedRecords.has(child.id))) {
            newSelectedRecords.delete(parentId);
          }
          parentId = childParentMap[parentId];
        }
      };

      // Keeping track of selected records to auto check/uncheck select all checkbox in bulk action menu
      let newSelection = new Set();

      setSelectedRecords((prevSelected) => {
        let newSelectedRecords = new Set(prevSelected);
        updateSelection(record, checked, newSelectedRecords);
        record.collectionId && checkParentSelection(record.id, checked, newSelectedRecords);
        newSelection = newSelectedRecords;
        return newSelectedRecords;
      });

      const totalRecordsCount = updatedRecords.collections.length + updatedRecords.requests.length;
      setIsAllRecordsSelected(newSelection.size === totalRecordsCount);
    },
    [updatedRecords]
  );

  useEffect(() => {
    const id = requestId || collectionId;
    setExpandedRecordIds((prev: RQAPI.Record["id"][]) =>
      union(prev, getRecordIdsToBeExpanded(id, prev, apiClientRecords))
    );
  }, [collectionId, requestId, apiClientRecords]);

  return (
    <>
      {apiClientRecords.length > 0 && (
        <div className="api-client-sidebar-header-container">
          <SidebarListHeader onSearch={setSearchValue} multiSelectOptions={multiSelectOptions} />
          {showSelection && (
            <ActionMenu
              isAllRecordsSelected={isAllRecordsSelected}
              toggleSelection={toggleSelection}
              bulkActionsHandler={bulkActionHandler}
            />
          )}
        </div>
      )}
      <div className={`collections-list-container ${showSelection ? "selection-enabled" : ""}`}>
        <div className="collections-list-content">
          {isLoadingApiClientRecords ? (
            <div className="api-client-sidebar-placeholder">
              <Typography.Text type="secondary">Loading...</Typography.Text>
            </div>
          ) : updatedRecords.count > 0 ? (
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
                    onExportClick={handleExportCollection}
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
                    bulkActionOptions={{ showSelection, selectedRecords, recordsSelectionHandler, setShowSelection }}
                  />
                );
              })}

              {isRecordBeingCreated === RQAPI.RecordType.API && recordTypeToBeCreated === RQAPI.RecordType.API && (
                <div className="mt-8">
                  <SidebarPlaceholderItem name="New Request" />
                </div>
              )}
            </div>
          ) : (
            <ApiRecordEmptyState
              disabled={!isValidPermission}
              newRecordBtnText="New collection"
              message={searchValue ? "No collection or request found" : "No collections created yet"}
              onNewRecordClick={() => onNewClick("collection_list_empty_state", RQAPI.RecordType.COLLECTION)}
              analyticEventSource="collection_list_empty_state"
            />
          )}
        </div>
        {errorFiles.length > 0 && <ErrorFilesList errorFiles={errorFiles} />}
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
      {isMoveCollectionModalOpen && (
        <MoveToCollectionModal
          recordsToMove={filterOutChildrenRecords(
            selectedRecords,
            updatedRecords.childParentMap,
            updatedRecords.recordsMap
          )}
          isOpen={isMoveCollectionModalOpen}
          onClose={() => {
            setIsMoveCollectionModalOpen(false);
          }}
        />
      )}
    </>
  );
};
