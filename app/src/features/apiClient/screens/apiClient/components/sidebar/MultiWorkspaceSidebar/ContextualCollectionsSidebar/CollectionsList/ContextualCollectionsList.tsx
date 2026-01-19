import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { RQAPI } from "features/apiClient/types";
import { useApiClientContext } from "features/apiClient/contexts";
import { sessionStorage } from "utils/sessionStorage";
import "./contextualCollectionsList.scss";
import { union } from "lodash";
import { SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY } from "features/apiClient/constants";
import { useRBAC } from "features/rbac";
import { useAllRecords, useChildToParent } from "features/apiClient/slices/apiRecords/apiRecords.hooks";
import { getRecordIdsToBeExpanded, isApiCollection } from "features/apiClient/screens/apiClient/utils";
import { CollectionRow } from "../../../components/collectionsList/collectionRow/CollectionRow";
import { SidebarPlaceholderItem } from "../../../components/SidebarPlaceholderItem/SidebarPlaceholderItem";
import { RequestRow } from "../../../components/collectionsList/requestRow/RequestRow";
import { ApiRecordEmptyState } from "../../../components/collectionsList/apiRecordEmptyState/ApiRecordEmptyState";

import {
  getRecordsToExpandBySearchValue,
  getRecordsToRender,
  selectAllRecords,
} from "features/apiClient/commands/utils";
import { updateRecordSelection } from "./utils";
import { ApiClientFeatureContext, useApiClientFeatureContext, WorkspaceInfo } from "features/apiClient/slices";
import { EXPANDED_RECORD_IDS_UPDATED } from "features/apiClient/slices/exampleCollections";

interface Props {
  searchValue: string;
  onNewClick: (src: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType) => Promise<void>;
  recordTypeToBeCreated: RQAPI.RecordType | null;
  showSelection: boolean;
  selectAll: { value: boolean; takeAction: boolean };
  handleShowSelection: (value: boolean) => void;
  handleRecordSelection: (params: {
    contextId: WorkspaceInfo["id"];
    recordIds?: Set<string>;
    isAllRecordsSelected?: boolean;
  }) => void;
  handleRecordsToBeDeleted: (records: RQAPI.ApiClientRecord[], context: ApiClientFeatureContext) => void;
}

export const ContextualCollectionsList: React.FC<Props> = ({
  searchValue,
  onNewClick,
  recordTypeToBeCreated,
  showSelection,
  handleShowSelection,
  handleRecordSelection,
  selectAll,
  handleRecordsToBeDeleted,
}) => {
  const { collectionId, requestId } = useParams();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const apiClientRecords = useAllRecords();
  const childParentMap = useChildToParent();

  const { isRecordBeingCreated, onNewClickV2 } = useApiClientContext();
  const context = useApiClientFeatureContext();
  const [selectedRecords, setSelectedRecords] = useState<Set<RQAPI.ApiClientRecord["id"]>>(new Set());
  const [expandedRecordIds, setExpandedRecordIds] = useState(
    sessionStorage.getItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, [])
  );

  useEffect(() => {
    const handleUpdates = () => {
      setExpandedRecordIds(sessionStorage.getItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, []));
    };

    window.addEventListener(EXPANDED_RECORD_IDS_UPDATED, handleUpdates);
    return () => {
      window.removeEventListener(EXPANDED_RECORD_IDS_UPDATED, handleUpdates);
    };
  }, []);

  const updatedRecords = useMemo(() => {
    handleShowSelection(false);

    const recordsToRender = getRecordsToRender({ apiClientRecords, searchValue });
    const recordsToExpand = getRecordsToExpandBySearchValue({
      contextId: context.workspaceId,
      apiClientRecords,
      searchValue,
    });

    setExpandedRecordIds((prev: string[]) => {
      const newExpanded = prev.concat(recordsToExpand ?? []);
      return newExpanded;
    });

    return recordsToRender;
  }, [context.workspaceId, apiClientRecords, handleShowSelection, searchValue]);

  const handleRecordToggle = useCallback(
    (record: RQAPI.ApiClientRecord, isChecked: boolean) => {
      const checkParentSelection = (
        recordId: RQAPI.ApiClientRecord["id"],
        checked: boolean,
        newSelectedRecords: Set<RQAPI.ApiClientRecord["id"]>
      ) => {
        const { recordsMap } = updatedRecords;
        let parentId = childParentMap[recordId];
        while (parentId) {
          const parentRecord = recordsMap[parentId];
          if (!parentRecord || !isApiCollection(parentRecord)) break;

          const allChildrenSelected = parentRecord.data.children?.every((child) => newSelectedRecords.has(child.id));
          if (checked && allChildrenSelected) {
            newSelectedRecords.add(parentId);
          } else if (!checked && parentRecord.data.children?.some((child) => !newSelectedRecords.has(child.id))) {
            newSelectedRecords.delete(parentId);
          }
          parentId = childParentMap[parentId];
        }
      };

      let { newSelectedRecords } = updateRecordSelection(record, isChecked, selectedRecords);
      const totalRecordsCount = Object.keys(updatedRecords.recordsMap).length;

      if (record.collectionId) {
        checkParentSelection(record.id, isChecked, newSelectedRecords);
      }

      setSelectedRecords(newSelectedRecords);
      const isAllRecordsSelected = newSelectedRecords.size === totalRecordsCount;

      handleRecordSelection({
        contextId: context.workspaceId,
        recordIds: newSelectedRecords,
        isAllRecordsSelected,
      });
    },
    [context.workspaceId, selectedRecords, updatedRecords, childParentMap, handleRecordSelection]
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
          handleShowSelection(true);
        }
        handleRecordToggle(record, !selectedRecords.has(record.id));
      }
    },
    [showSelection, selectedRecords, handleRecordToggle, handleShowSelection]
  );

  useEffect(() => {
    const id = requestId || collectionId;
    if (!id) return;

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
    if (!selectAll.takeAction) {
      return;
    }

    if (selectAll.value) {
      const result = selectAllRecords({ contextId: context.workspaceId, searchValue });
      setSelectedRecords(result);
      handleRecordSelection({
        contextId: context.workspaceId,
        recordIds: result,
        isAllRecordsSelected: true,
      });
    } else {
      setSelectedRecords(new Set());
      handleRecordSelection({
        contextId: context.workspaceId,
        recordIds: new Set(),
      });
    }
  }, [selectAll, handleRecordSelection, context.workspaceId, searchValue]);

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
                    bulkActionOptions={{
                      showSelection,
                      selectedRecords,
                      recordsSelectionHandler,
                      setShowSelection: handleShowSelection,
                    }}
                    onRequestlyExportClick={() => {}}
                    // TODO: just pass contextId
                    onItemClick={handleItemClick}
                    handleRecordsToBeDeleted={(records) => handleRecordsToBeDeleted(records, context)}
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
                    onItemClick={handleItemClick}
                    handleRecordsToBeDeleted={(records) => handleRecordsToBeDeleted(records, context)}
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
              onNewClick={(src, recordType, collectionId, entryType) =>
                onNewClickV2({
                  contextId: context.workspaceId,
                  analyticEventSource: src,
                  recordType,
                  collectionId,
                  entryType,
                })
              }
            />
          )}
        </div>
      </div>
      {/* <MultiSelectNudge /> */}
    </>
  );
};
