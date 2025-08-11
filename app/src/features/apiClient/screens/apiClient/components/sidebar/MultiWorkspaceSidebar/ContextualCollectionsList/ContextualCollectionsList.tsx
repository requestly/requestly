import { useApiClientRepository } from "features/apiClient/helpers/modules/sync/useApiClientSyncRepo";
import { filterOutChildrenRecords, processRecordsForDuplication } from "features/apiClient/screens/apiClient/utils";
import { useApiClientMultiWorkspaceView } from "features/apiClient/store/multiWorkspaceView/multiWorkspaceView.store";
import { BulkActions, RQAPI } from "features/apiClient/types";
import { useRBAC } from "features/rbac";
import { head, isEmpty } from "lodash";
import React, { createContext, useCallback, useContext, useState } from "react";
import { DndProvider } from "react-dnd";
import { toast } from "utils/Toast";
import { SidebarListHeader } from "../../components/sidebarListHeader/SidebarListHeader";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CollectionsList } from "./CollectionsList/CollectionsList";
import ActionMenu from "../../components/collectionsList/BulkActionsMenu";
import { useApiClientContext } from "features/apiClient/contexts";
import { notification } from "antd";
import * as Sentry from "@sentry/react";
import { useAPIRecords } from "features/apiClient/store/apiRecords/ApiRecordsContextProvider";

const ContextIdContext = createContext<string | null>(null);

export function ContextId(props: { id: string; children: React.ReactNode }) {
  return <ContextIdContext.Provider value={props.id}>{props.children}</ContextIdContext.Provider>;
}

export function useContextId() {
  const contextId = useContext(ContextIdContext);
  return contextId;
}

export const ContextualCollectionsList: React.FC<{
  searchValue: string;
  setSearchValue: (value: string) => void;
  onNewClick: (src: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType) => Promise<void>;
  recordTypeToBeCreated: RQAPI.RecordType | null;
}> = ({ searchValue, setSearchValue, onNewClick, recordTypeToBeCreated }) => {
  const { validatePermission } = useRBAC();
  const { isValidPermission } = validatePermission("api_client_request", "create");
  const selectedWorkspaces = useApiClientMultiWorkspaceView((s) => s.selectedWorkspaces);

  const [showSelection, setShowSelection] = useState(false);
  const [isMoveCollectionModalOpen, setIsMoveCollectionModalOpen] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<RQAPI.ApiClientRecord["id"]>>(new Set());
  const [isAllRecordsSelected, setIsAllRecordsSelected] = useState(false);

  const { apiClientRecordsRepository } = useApiClientRepository();
  // const { isRecordBeingCreated, setIsDeleteModalOpen, updateRecordsToBeDeleted, onSaveRecord, onSaveBulkRecords } =
  //   useApiClientContext();

  // const [childParentMap] = useAPIRecords((state) => [state.childParentMap]);
  // const bulkActionHandler = useCallback(
  //   async (action: BulkActions) => {
  //     if (isEmpty(selectedRecords) && action !== BulkActions.SELECT_ALL) {
  //       toast.error("Please Select Records");
  //       return;
  //     }

  //     const processedRecords = filterOutChildrenRecords(selectedRecords, childParentMap, updatedRecords.recordsMap);
  //     switch (action) {
  //       case BulkActions.DUPLICATE: {
  //         const recordsToDuplicate = processRecordsForDuplication(processedRecords, apiClientRecordsRepository);

  //         try {
  //           const result = await apiClientRecordsRepository.duplicateApiEntities(recordsToDuplicate);

  //           toast.success("Records Duplicated successfully");
  //           result.length === 1 ? onSaveRecord(head(result)!, "open") : onSaveBulkRecords(result);
  //         } catch (error) {
  //           console.error("Error Duplicating records: ", error);
  //           notification.error({
  //             message: "Failed to duplicate some records",
  //             description: error?.message,
  //             placement: "bottomRight",
  //           });
  //           Sentry.withScope((scope) => {
  //             scope.setTag("error_type", "api_client_record_duplication");
  //             Sentry.captureException(error);
  //           });
  //         }

  //         break;
  //       }

  //       case BulkActions.DELETE:
  //         setIsDeleteModalOpen(true);
  //         updateRecordsToBeDeleted(processedRecords);
  //         break;

  //       case BulkActions.EXPORT:
  //         setIsExportModalOpen(true);
  //         setCollectionsToExport(processedRecords);

  //         break;

  //       case BulkActions.MOVE:
  //         setIsMoveCollectionModalOpen(true);
  //         break;

  //       case BulkActions.SELECT_ALL:
  //         setIsAllRecordsSelected((prev) => !prev);
  //         if (isAllRecordsSelected) {
  //           setSelectedRecords(new Set());
  //         } else {
  //           const newSelectedRecords: Set<RQAPI.ApiClientRecord["id"]> = new Set();
  //           updatedRecords.collections.forEach((record) => {
  //             addNestedCollection(record, newSelectedRecords);
  //           });
  //           updatedRecords.requests.forEach((record) => {
  //             newSelectedRecords.add(record.id);
  //           });
  //           setSelectedRecords(newSelectedRecords);
  //         }
  //         break;

  //       default:
  //         break;
  //     }
  //   },
  //   [
  //     selectedRecords,
  //     childParentMap,
  //     updatedRecords.recordsMap,
  //     updatedRecords.collections,
  //     updatedRecords.requests,
  //     setIsDeleteModalOpen,
  //     updateRecordsToBeDeleted,
  //     isAllRecordsSelected,
  //     apiClientRecordsRepository,
  //     onSaveRecord,
  //     onSaveBulkRecords,
  //     addNestedCollection,
  //   ]
  // );

  const toggleSelection = useCallback(() => {
    setSelectedRecords(new Set());
    setShowSelection((prev) => !prev);
    setIsAllRecordsSelected(false);
  }, [setSelectedRecords, setShowSelection]);

  const multiSelectOptions = {
    showMultiSelect: isValidPermission,
    toggleMultiSelect: toggleSelection,
  };

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

        {/* {showSelection && (
          <ActionMenu
            isAllRecordsSelected={isAllRecordsSelected}
            toggleSelection={toggleSelection}
            bulkActionsHandler={bulkActionHandler}
          />
        )} */}
      </div>

      {selectedWorkspaces.map((workspace) => {
        return (
          <ContextId id={workspace.getState().id}>
            <CollectionsList
              searchValue={searchValue}
              onNewClick={onNewClick}
              recordTypeToBeCreated={recordTypeToBeCreated}
            />
          </ContextId>
        );
      })}
    </DndProvider>
  );
};
