import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { RQAPI } from "features/apiClient/types";
import { Typography } from "antd";
import { useApiClientContext } from "features/apiClient/contexts";
import { CollectionRow } from "./collectionRow/CollectionRow";
import { RequestRow } from "./requestRow/RequestRow";
import { convertFlatRecordsToNestedRecords, isApiCollection, isApiRequest, updateActiveKeys } from "../../../../utils";
import { ApiRecordEmptyState } from "./apiRecordEmptyState/ApiRecordEmptyState";
import { ExportCollectionsModal } from "../../../modals/exportCollectionsModal/ExportCollectionsModal";
import { trackExportCollectionsClicked } from "modules/analytics/events/features/apiClient";
import { useTabsLayoutContext } from "layouts/TabsLayout";
import PATHS from "config/constants/sub/paths";
import { SidebarPlaceholderItem } from "../SidebarPlaceholderItem/SidebarPlaceholderItem";
import { sessionStorage } from "utils/sessionStorage";
import "./collectionsList.scss";
import { isEmpty, union } from "lodash";

interface Props {
  onNewClick: (src: RQAPI.AnalyticsEventSource, recordType: RQAPI.RecordType) => Promise<void>;
  recordTypeToBeCreated: RQAPI.RecordType;
}

export const CollectionsList: React.FC<Props> = ({ onNewClick, recordTypeToBeCreated }) => {
  const navigate = useNavigate();
  const { collectionId, requestId } = useParams();
  const location = useLocation();
  const { openTab, tabs } = useTabsLayoutContext();
  const { isLoadingApiClientRecords, apiClientRecords, isRecordBeingCreated } = useApiClientContext();
  const [collectionsToExport, setCollectionsToExport] = useState<RQAPI.CollectionRecord[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activeKeys, setActiveKeys] = useState(sessionStorage.getItem("active_collection_keys", []));

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
  }, [updatedRecords.requests, isLoadingApiClientRecords, openTab, location.pathname, tabs.length]);

  const updateActiveKeysHandler = useCallback(
    (keys: string[], record: RQAPI.Record) => {
      setActiveKeys((prev: RQAPI.Record["id"][]) => {
        const updatedKeys = updateActiveKeys(apiClientRecords, record.id, prev);
        const updatedActiveKeys = isEmpty(keys) ? prev.filter((key) => key !== record.id) : union(prev, updatedKeys);

        isEmpty(updatedActiveKeys)
          ? sessionStorage.removeItem("active_collection_keys")
          : sessionStorage.setItem("active_collection_keys", updatedActiveKeys);

        return updatedActiveKeys;
      });
    },
    [apiClientRecords, activeKeys]
  );

  useEffect(() => {
    const id = requestId || collectionId;
    setActiveKeys((prev: RQAPI.Record["id"][]) => union(prev, updateActiveKeys(apiClientRecords, id, prev)));
  }, [collectionId, requestId, apiClientRecords]);

  return (
    <>
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
                    activeKeys={activeKeys}
                    onExportClick={handleExportCollection}
                    updateActiveKeysHandler={updateActiveKeysHandler}
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
                return <RequestRow key={record.id} record={record} openTab={openTab} />;
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
              message="No collections created yet"
              onNewRecordClick={() => onNewClick("collection_list_empty_state", RQAPI.RecordType.COLLECTION)}
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
