import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import { trackExportCollectionsClicked } from "modules/analytics/events/features/apiClient";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import PATHS from "config/constants/sub/paths";
import { SidebarPlaceholderItem } from "../SidebarPlaceholderItem/SidebarPlaceholderItem";
import { sessionStorage } from "utils/sessionStorage";
import { SidebarListHeader } from "../sidebarListHeader/SidebarListHeader";
import "./collectionsList.scss";
import { isEmpty, union } from "lodash";
import { SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY } from "features/apiClient/constants";
import { ApiClientExportModal } from "../../../modals/exportModal/ApiClientExportModal";
import { upsertApiRecord } from "backend/apiClient";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { toast } from "utils/Toast";
import { MoveToCollectionModal } from "../../../modals/MoveToCollectionModal/MoveToCollectionModal";
import ActionMenu from "./BulkActionsMenu";

interface Props {
  onNewClick: (src: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType) => Promise<void>;
  recordTypeToBeCreated: RQAPI.RecordType;
}

export const CollectionsList: React.FC<Props> = ({ onNewClick, recordTypeToBeCreated }) => {
  const navigate = useNavigate();
  const { collectionId, requestId } = useParams();

  const user = useSelector(getUserAuthDetails);
  const team = useSelector(getCurrentlyActiveWorkspace);

  const location = useLocation();
  const { openTab, tabs } = useTabsLayoutContext();
  const {
    isLoadingApiClientRecords,
    apiClientRecords,
    isRecordBeingCreated,
    setIsDeleteModalOpen,
    updateRecordToBeDeleted,
    onSaveRecord,
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

  const prepareRecordsToRender = useCallback((records: RQAPI.Record[]) => {
    const { updatedRecords, recordsMap } = convertFlatRecordsToNestedRecords(records);

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
    trackExportCollectionsClicked();
    setIsExportModalOpen(true);
  }, []);

  const toggleSelection = useCallback(() => {
    setSelectedRecords(new Set());
    setShowSelection((prev) => !prev);
  }, [setSelectedRecords, setShowSelection]);

  const multiSelectOptions = {
    showMultiSelect: true,
    toggleMultiSelect: toggleSelection,
  };

  const bulkActionHandler = useCallback(
    async (action: BulkActions) => {
      if (isEmpty(selectedRecords)) {
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
          const recordsToDuplicate: RQAPI.Record[] = [];
          processRecordsForDuplication(processedRecords, recordsToDuplicate);

          const results = await Promise.all(
            recordsToDuplicate.map((request) =>
              upsertApiRecord(user?.details?.profile?.uid, request, team?.id, request.id)
            )
          );

          const allSuccessful = results.every((result) => result.success);
          if (allSuccessful) {
            toast.success("Records Duplicated successfully");
            results.forEach((result) => onSaveRecord(result.data, "none"));
          } else {
            toast.error("Failed to duplicate some records");
          }

          break;
        }

        case BulkActions.DELETE:
          setIsDeleteModalOpen(true);
          updateRecordToBeDeleted(processedRecords);
          break;

        case BulkActions.EXPORT:
          setIsExportModalOpen(true);
          setCollectionsToExport(processedRecords);

          break;

        case BulkActions.MOVE:
          setIsMoveCollectionModalOpen(true);
          break;

        default:
          break;
      }
    },
    [
      selectedRecords,
      user?.details?.profile?.uid,
      team?.id,
      upsertApiRecord,
      onSaveRecord,
      updatedRecords.childParentMap,
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

      setSelectedRecords((prevSelected) => {
        let newSelectedRecords = new Set(prevSelected);
        updateSelection(record, checked, newSelectedRecords);
        record.collectionId && checkParentSelection(record.id, checked, newSelectedRecords);
        return newSelectedRecords;
      });
    },
    [updatedRecords]
  );

  useEffect(() => {
    if (isLoadingApiClientRecords) {
      return;
    }

    if (tabs.length === 0) {
      navigate(PATHS.API_CLIENT.ABSOLUTE);
    }
  }, [tabs.length, navigate, isLoadingApiClientRecords]);

  const hasOpenedDefaultTab = useRef(false);

  useEffect(() => {
    if (location.pathname === PATHS.API_CLIENT.ABSOLUTE) {
      // TODO: Improve logic
      hasOpenedDefaultTab.current = false;
    }

    if (isLoadingApiClientRecords) {
      return;
    }

    if (hasOpenedDefaultTab.current) {
      return;
    }

    hasOpenedDefaultTab.current = true;

    if (tabs.length > 0) {
      return;
    }
  }, [updatedRecords.requests, isLoadingApiClientRecords, openTab, location.pathname, tabs.length]);

  useEffect(() => {
    const id = requestId || collectionId;
    setExpandedRecordIds((prev: RQAPI.Record["id"][]) =>
      union(prev, getRecordIdsToBeExpanded(id, prev, apiClientRecords))
    );
  }, [collectionId, requestId, apiClientRecords]);

  return (
    <>
      {apiClientRecords.length > 0 && (
        <SidebarListHeader onSearch={setSearchValue} multiSelectOptions={multiSelectOptions} />
      )}
      <div className="collections-list-container">
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
                    openTab={openTab}
                    key={record.id}
                    record={record}
                    onNewClick={onNewClick}
                    expandedRecordIds={expandedRecordIds}
                    setExpandedRecordIds={setExpandedRecordIds}
                    onExportClick={handleExportCollection}
                    showSelection={showSelection}
                    selectedRecords={selectedRecords}
                    recordsSelectionHandler={recordsSelectionHandler}
                    setShowSelection={setShowSelection}
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
                    openTab={openTab}
                    showSelection={showSelection}
                    recordsSelectionHandler={recordsSelectionHandler}
                    selectedRecords={selectedRecords}
                    setShowSelection={setShowSelection}
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
              newRecordBtnText="New collection"
              message={searchValue ? "No collection or request found" : "No collections created yet"}
              onNewRecordClick={() => onNewClick("collection_list_empty_state", RQAPI.RecordType.COLLECTION)}
              recordType={RQAPI.RecordType.COLLECTION}
              analyticEventSource="collection_list_empty_state"
            />
          )}
        </div>
      </div>
      {isExportModalOpen && (
        <ApiClientExportModal
          exportType="collection"
          collectionsAndApis={collectionsToExport}
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
      {showSelection && <ActionMenu toggleSelection={toggleSelection} bulkActionsHandler={bulkActionHandler} />}
    </>
  );
};
