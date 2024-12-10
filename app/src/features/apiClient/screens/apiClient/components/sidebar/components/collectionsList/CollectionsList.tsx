import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RQAPI } from "features/apiClient/types";
import { Typography } from "antd";
import { useApiClientContext } from "features/apiClient/contexts";
import { NewRecordNameInput } from "./newRecordNameInput/NewRecordNameInput";
import { CollectionRow } from "./collectionRow/CollectionRow";
import { RequestRow } from "./requestRow/RequestRow";
import { convertFlatRecordsToNestedRecords, isApiCollection, isApiRequest } from "../../../../utils";
import { ApiRecordEmptyState } from "./apiRecordEmptyState/ApiRecordEmptyState";
import { ExportCollectionsModal } from "../../../modals/exportCollectionsModal/ExportCollectionsModal";
import { trackExportCollectionsClicked } from "modules/analytics/events/features/apiClient";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import PATHS from "config/constants/sub/paths";
import "./collectionsList.scss";

interface Props {
  onNewClick: (src: RQAPI.AnalyticsEventSource) => void;
  recordTypeToBeCreated: RQAPI.RecordType;
  isNewRecordNameInputVisible: boolean;
  hideNewRecordNameInput: () => void;
}

export const CollectionsList: React.FC<Props> = ({
  onNewClick,
  recordTypeToBeCreated,
  isNewRecordNameInputVisible,
  hideNewRecordNameInput,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openTab, tabs } = useTabsLayoutContext();
  const { isLoadingApiClientRecords, apiClientRecords } = useApiClientContext();
  const [collectionsToExport, setCollectionsToExport] = useState<RQAPI.CollectionRecord[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const prepareRecordsToRender = useCallback((records: RQAPI.Record[]) => {
    const updatedRecords = convertFlatRecordsToNestedRecords(records);

    updatedRecords.sort((recordA, recordB) => {
      // If different type, then keep collection first
      if (recordA.type !== recordB.type) {
        return recordA.type === RQAPI.RecordType.COLLECTION ? -1 : 1;
      }

      // If types are the same, sort by creation date
      return recordA.createdTs - recordB.createdTs;
    });

    return {
      count: updatedRecords.length,
      collections: updatedRecords.filter((record) => isApiCollection(record)) as RQAPI.CollectionRecord[],
      requests: updatedRecords.filter((record) => isApiRequest(record)) as RQAPI.ApiRecord[],
    };
  }, []);

  const updatedRecords = useMemo(() => prepareRecordsToRender(apiClientRecords), [
    apiClientRecords,
    prepareRecordsToRender,
  ]);

  const handleExportCollection = useCallback((collection: RQAPI.CollectionRecord) => {
    setCollectionsToExport((prev) => [...prev, collection]);
    trackExportCollectionsClicked();
    setIsExportModalOpen(true);
  }, []);

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

    if (updatedRecords.requests.length) {
      const recordId = updatedRecords.requests[0].id;
      openTab(recordId, {
        title: updatedRecords.requests[0].name,
        url: `${PATHS.API_CLIENT.ABSOLUTE}/request/${recordId}`,
      });
    }
  }, [updatedRecords.requests, isLoadingApiClientRecords, openTab, location.pathname, tabs.length]);

  return (
    <>
      <div className="collections-list-container">
        <div className="collections-list-content">
          {isLoadingApiClientRecords ? (
            <div className="api-client-sidebar-placeholder">
              <Typography.Text type="secondary">Loading...</Typography.Text>
            </div>
          ) : updatedRecords.count > 0 || isNewRecordNameInputVisible ? (
            <div className="collections-list">
              {updatedRecords.collections.map((record) => {
                return (
                  <CollectionRow
                    openTab={openTab}
                    key={record.id}
                    record={record}
                    onNewClick={onNewClick}
                    onExportClick={handleExportCollection}
                  />
                );
              })}

              {isNewRecordNameInputVisible && recordTypeToBeCreated === RQAPI.RecordType.COLLECTION ? (
                <NewRecordNameInput
                  recordType={RQAPI.RecordType.COLLECTION}
                  analyticEventSource="api_client_sidebar"
                  onSuccess={() => hideNewRecordNameInput()}
                />
              ) : null}

              {updatedRecords.requests.map((record) => {
                return <RequestRow key={record.id} record={record} openTab={openTab} />;
              })}

              {isNewRecordNameInputVisible && recordTypeToBeCreated === RQAPI.RecordType.API ? (
                <NewRecordNameInput
                  recordType={RQAPI.RecordType.API}
                  analyticEventSource="api_client_sidebar"
                  onSuccess={() => hideNewRecordNameInput()}
                />
              ) : null}
            </div>
          ) : (
            <ApiRecordEmptyState
              newRecordBtnText="New collection"
              message="No collections created yet"
              onNewRecordClick={() => onNewClick("collection_list_empty_state")}
              recordType={RQAPI.RecordType.COLLECTION}
              analyticEventSource="collection_list_empty_state"
            />
          )}
        </div>
      </div>
      {isExportModalOpen && (
        <ExportCollectionsModal
          collections={collectionsToExport}
          isOpen={isExportModalOpen}
          onClose={() => {
            setCollectionsToExport([]);
            setIsExportModalOpen(false);
          }}
        />
      )}
    </>
  );
};
