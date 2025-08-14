import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { RQAPI } from "features/apiClient/types";
import { useApiClientContext } from "features/apiClient/contexts";
import { sessionStorage } from "utils/sessionStorage";
import "./collectionsList.scss";
import { union } from "lodash";
import { SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY } from "features/apiClient/constants";
import { useRBAC } from "features/rbac";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";
import { EXPANDED_RECORD_IDS_UPDATED } from "features/apiClient/exampleCollections/store";
import {
  convertFlatRecordsToNestedRecords,
  filterOutChildrenRecords,
  filterRecordsBySearch,
  getRecordIdsToBeExpanded,
  isApiCollection,
  isApiRequest,
} from "features/apiClient/screens/apiClient/utils";
import { CollectionRow } from "../../../components/collectionsList/collectionRow/CollectionRow";
import { SidebarPlaceholderItem } from "../../../components/SidebarPlaceholderItem/SidebarPlaceholderItem";
import { RequestRow } from "../../../components/collectionsList/requestRow/RequestRow";
import { ApiRecordEmptyState } from "../../../components/collectionsList/apiRecordEmptyState/ApiRecordEmptyState";
import { ApiClientExportModal } from "../../../../modals/exportModal/ApiClientExportModal";
import { MoveToCollectionModal } from "../../../../modals/MoveToCollectionModal/MoveToCollectionModal";
import { useContextId } from "features/apiClient/contexts/contextId.context";
import { RecordSelectionAction } from "../ContextualCollectionsList";
import { selectAllRecords } from "../../../utils";

interface Props {
  searchValue: string;
  onNewClick: (src: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType) => Promise<void>;
  recordTypeToBeCreated: RQAPI.RecordType | null;
  showSelection: boolean;
  isSelectAll: boolean;
  handleShowSelection: (value: boolean) => void;
  handleRecordSelection: (params: {
    contextId: string;
    action: RecordSelectionAction;
    recordIds: Set<string>;
    isAllRecordsSelected: boolean;
  }) => void;
}

export const CollectionsList: React.FC<Props> = ({
  searchValue,
  onNewClick,
  recordTypeToBeCreated,
  showSelection,
  handleShowSelection,
  handleRecordSelection,
  isSelectAll,
}) => {
  const { collectionId, requestId } = useParams();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const [apiClientRecords] = useAPIRecords((state) => [state.apiClientRecords]);

  const { isRecordBeingCreated } = useApiClientContext();
  const contextId = useContextId();

  const [collectionsToExport, setCollectionsToExport] = useState<RQAPI.ApiClientRecord[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMoveCollectionModalOpen, setIsMoveCollectionModalOpen] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<RQAPI.ApiClientRecord["id"]>>(new Set());
  const [expandedRecordIds, setExpandedRecordIds] = useState(
    sessionStorage.getItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, [])
  );

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

  const prepareRecordsToRender = useCallback(
    (records: RQAPI.ApiClientRecord[]) => {
      const { updatedRecords, recordsMap } = convertFlatRecordsToNestedRecords(records);
      handleShowSelection(false);

      updatedRecords.sort((recordA, recordB) => {
        // If different type, then keep collection first
        if (recordA.type === RQAPI.RecordType.COLLECTION && recordA.isExample) {
          return -1;
        }

        if (recordB.type === RQAPI.RecordType.COLLECTION && recordB.isExample) {
          return -1;
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
    },
    [handleShowSelection]
  );

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

  const handleExportCollection = useCallback((collection: RQAPI.CollectionRecord) => {
    setCollectionsToExport((prev) => [...prev, collection]);
    setIsExportModalOpen(true);
  }, []);

  // Main toggle handler
  const recordsSelectionHandler = useCallback(
    (record: RQAPI.ApiClientRecord, event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;

      const updateSelection = (
        record: RQAPI.ApiClientRecord,
        checked: boolean,
        newSelectedRecords: Set<RQAPI.ApiClientRecord["id"]>
      ) => {
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
        recordId: RQAPI.ApiClientRecord["id"],
        checked: boolean,
        newSelectedRecords: Set<RQAPI.ApiClientRecord["id"]>
      ) => {
        const { recordsMap } = updatedRecords;
        let parentId = childParentMap.get(recordId);
        while (parentId) {
          const parentRecord = recordsMap[parentId];
          if (!parentRecord || !isApiCollection(parentRecord)) break;

          const allChildrenSelected = parentRecord.data.children.every((child) => newSelectedRecords.has(child.id));
          if (checked && allChildrenSelected) {
            newSelectedRecords.add(parentId);
          } else if (!checked && parentRecord.data.children.some((child) => !newSelectedRecords.has(child.id))) {
            newSelectedRecords.delete(parentId);
          }
          parentId = childParentMap.get(parentId);
        }
      };

      // Keeping track of selected records to auto check/uncheck select all checkbox in bulk action menu
      setSelectedRecords((prevSelected) => {
        let newSelectedRecords = new Set(prevSelected);
        updateSelection(record, checked, newSelectedRecords);
        record.collectionId && checkParentSelection(record.id, checked, newSelectedRecords);

        const totalRecordsCount = updatedRecords.collections.length + updatedRecords.requests.length;
        handleRecordSelection({
          contextId,
          action: "select",
          recordIds: newSelectedRecords,
          isAllRecordsSelected: newSelectedRecords.size === totalRecordsCount,
        });

        return newSelectedRecords;
      });
    },
    [contextId, updatedRecords, childParentMap, handleRecordSelection]
  );

  useEffect(() => {
    const id = requestId || collectionId;
    setExpandedRecordIds((prev: RQAPI.ApiClientRecord["id"][]) =>
      union(prev, getRecordIdsToBeExpanded(id, prev, apiClientRecords))
    );
  }, [collectionId, requestId, apiClientRecords]);

  useEffect(() => {
    if (!showSelection) {
      setSelectedRecords(new Set());
    }
  }, [showSelection]);

  useEffect(() => {
    if (isSelectAll) {
      const result = selectAllRecords({ contextId, searchValue });
      handleRecordSelection({
        contextId,
        action: "select",
        recordIds: result,
        isAllRecordsSelected: true,
      });
      setSelectedRecords(result);
    } else {
      setSelectedRecords(new Set());
    }
  }, [isSelectAll, handleRecordSelection, contextId, searchValue]);

  return (
    <>
      <div className={`collections-list-container ${showSelection ? "selection-enabled" : ""}`}>
        <div className="collections-list-content">
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
                    onExportClick={handleExportCollection}
                    bulkActionOptions={{
                      showSelection,
                      selectedRecords,
                      recordsSelectionHandler,
                      setShowSelection: handleShowSelection,
                    }}
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
                    bulkActionOptions={{
                      showSelection,
                      selectedRecords,
                      recordsSelectionHandler,
                      setShowSelection: handleShowSelection,
                    }}
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

      {isMoveCollectionModalOpen && (
        <MoveToCollectionModal
          recordsToMove={filterOutChildrenRecords(selectedRecords, childParentMap, updatedRecords.recordsMap)}
          isOpen={isMoveCollectionModalOpen}
          onClose={() => {
            setIsMoveCollectionModalOpen(false);
          }}
        />
      )}
    </>
  );
};
