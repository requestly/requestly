import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { BulkActions, RQAPI } from "features/apiClient/types";
import { Authorization, RQAPI as SharedRQAPI } from "@requestly/shared/types/entities/apiClient";
import { notification } from "antd";
import { useApiClientContext } from "features/apiClient/contexts";
import { CollectionRow } from "./collectionRow/CollectionRow";
import { ExportType } from "features/apiClient/helpers/exporters/types";
import { RequestRow } from "./requestRow/RequestRow";
import {
  convertFlatRecordsToNestedRecords,
  isApiCollection,
  isApiRequest,
  filterRecordsBySearch,
  getRecordIdsToBeExpanded,
  filterOutChildrenRecords,
} from "../../../../utils";
import { ApiRecordEmptyState } from "./apiRecordEmptyState/ApiRecordEmptyState";
import { SidebarPlaceholderItem } from "../SidebarPlaceholderItem/SidebarPlaceholderItem";
import { sessionStorage } from "utils/sessionStorage";
import { SidebarListHeader } from "../sidebarListHeader/SidebarListHeader";
import "./collectionsList.scss";
import { debounce, head, isEmpty, union } from "lodash";
import { SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY } from "features/apiClient/constants";
import { ApiClientExportModal } from "../../../modals/exportModal/ApiClientExportModal";
import { PostmanExportModal } from "../../../modals/postmanCollectionExportModal/PostmanCollectionExportModal";
import { CommonApiClientExportModal } from "../../../modals/CommonApiClientExportModal";
import { ExporterFunction } from "features/apiClient/helpers/exporters/types";
import { toast } from "utils/Toast";
import { MoveToCollectionModal } from "../../../modals/MoveToCollectionModal/MoveToCollectionModal";
import { createOpenApiExporter } from "features/apiClient/helpers/exporters/openapi";
import ActionMenu from "./BulkActionsMenu";
import { useRBAC } from "features/rbac";
import * as Sentry from "@sentry/react";
import { ExampleCollectionsNudge } from "../ExampleCollectionsNudge/ExampleCollectionsNudge";
import { useNewApiClientContext } from "features/apiClient/hooks/useNewApiClientContext";
import { submitAttrUtil } from "utils/AnalyticsUtils";
import APP_CONSTANTS from "config/constants";
import { duplicateRecords, useAllRecords, useApiClientRepository, useChildToParent } from "features/apiClient/slices";
import { useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";
import { EXPANDED_RECORD_IDS_UPDATED } from "features/apiClient/slices/exampleCollections";

interface Props {
  onNewClick: (src: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType) => Promise<void>;
  recordTypeToBeCreated: RQAPI.RecordType | null;
  handleRecordsToBeDeleted: (records: RQAPI.ApiClientRecord[]) => void;
}

const wrapRecordsInCollection = (processedRecords: RQAPI.ApiClientRecord[]): RQAPI.CollectionRecord => {
  const dummyCollection: RQAPI.CollectionRecord = {
    id: `rq-collection-${Date.now()}`,
    name: "Requestly Collection",
    description: "Exported from Requestly API Client",
    type: RQAPI.RecordType.COLLECTION,
    collectionId: null,
    deleted: false,
    data: {
      children: processedRecords,
      variables: {},
      auth: {
        currentAuthType: Authorization.Type.INHERIT,
        authConfigStore: {},
      },
    },
    createdTs: Date.now(),
    updatedTs: Date.now(),
    ownerId: "",
    createdBy: "",
    updatedBy: "",
  };

  return dummyCollection;
};

const trackUserProperties = (records: RQAPI.ApiClientRecord[]) => {
  const totalCollections = records.filter((record) => isApiCollection(record)).length;
  const totalRequests = records.length - totalCollections;
  submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_COLLECTIONS, totalCollections);
  submitAttrUtil(APP_CONSTANTS.GA_EVENTS.ATTR.NUM_REQUESTS, totalRequests);
};

export const CollectionsList: React.FC<Props> = ({ onNewClick, recordTypeToBeCreated, handleRecordsToBeDeleted }) => {
  const { collectionId, requestId } = useParams();
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const apiClientRecords = useAllRecords();
  const childParentMap = useChildToParent();

  const { isRecordBeingCreated } = useApiClientContext();
  const { onSaveRecord } = useNewApiClientContext();

  const { apiClientRecordsRepository } = useApiClientRepository();
  const dispatch = useApiClientDispatch();

  const [collectionsToExport, setCollectionsToExport] = useState<RQAPI.ApiClientRecord[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPostmanExportModalOpen, setIsPostmanExportModalOpen] = useState(false);
  const [commonExporterConfig, setCommonExporterConfig] = useState<{
    title: string;
    exporter: ExporterFunction;
    exportType: ExportType;
  } | null>(null);
  const [showSelection, setShowSelection] = useState(false);
  const [isMoveCollectionModalOpen, setIsMoveCollectionModalOpen] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<RQAPI.ApiClientRecord["id"]>>(new Set());
  const [expandedRecordIds, setExpandedRecordIds] = useState(
    sessionStorage.getItem(SESSION_STORAGE_EXPANDED_RECORD_IDS_KEY, [])
  );
  const [searchValue, setSearchValue] = useState("");
  const [isAllRecordsSelected, setIsAllRecordsSelected] = useState(false);

  const debouncedTrackUserProperties = useMemo(
    () => debounce(() => trackUserProperties(apiClientRecords), 1000),
    [] // Empty deps - debounce function should be stable
  );

  useEffect(() => {
    debouncedTrackUserProperties();
    return () => {
      debouncedTrackUserProperties.cancel();
    };
  }, [apiClientRecords, debouncedTrackUserProperties]);

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
          let parentId = childParentMap[record.collectionId];
          while (parentId) {
            recordsToExpand.push(parentId);
            parentId = childParentMap[parentId];
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

      const dummyCollection = wrapRecordsInCollection(processedRecords);

      switch (action) {
        case BulkActions.DUPLICATE: {
          try {
            const { duplicatedRecords } = await dispatch(
              duplicateRecords({
                recordIds: selectedRecords,
                repository: apiClientRecordsRepository,
              })
            ).unwrap();

            toast.success("Records Duplicated successfully");
            if (duplicatedRecords.length === 1) {
              onSaveRecord(head(duplicatedRecords)!, "open");
            }
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

        case BulkActions.EXPORT_OPENAPI: {
          const exporter = createOpenApiExporter(dummyCollection as SharedRQAPI.CollectionRecord);
          setCommonExporterConfig({
            exporter,
            exportType: ExportType.OPENAPI,
            title: "OpenAPI 3.0",
          });
          break;
        }

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
      dispatch,
      apiClientRecordsRepository,
      onSaveRecord,
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
        <div className="collections-list-content">
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

      {commonExporterConfig && (
        <CommonApiClientExportModal
          isOpen={true}
          onClose={() => setCommonExporterConfig(null)}
          title={commonExporterConfig.title}
          exporter={commonExporterConfig.exporter}
          exporterType={commonExporterConfig.exportType}
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
