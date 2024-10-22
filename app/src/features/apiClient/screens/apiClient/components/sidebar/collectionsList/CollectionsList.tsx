import React, { useCallback, useMemo } from "react";
import { RQAPI } from "features/apiClient/types";
import { Typography } from "antd";
import { useApiClientContext } from "features/apiClient/contexts";
import { NewRecordNameInput } from "./newRecordNameInput/NewRecordNameInput";
import { CollectionRow } from "./collectionRow/CollectionRow";
import { RequestRow } from "./requestRow/RequestRow";
import { isApiCollection, isApiRequest } from "../../../utils";
import { ApiRecordEmptyState } from "./apiRecordEmptyState/ApiRecordEmptyState";
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
  const { isLoadingApiClientRecords, apiClientRecords } = useApiClientContext();

  const prepareRecordsToRender = useCallback((records: RQAPI.Record[]) => {
    const collections: Record<RQAPI.CollectionRecord["id"], RQAPI.CollectionRecord> = {};
    const requests: RQAPI.ApiRecord[] = [];

    // TODO: improve logic
    records.forEach((record) => {
      if (isApiCollection(record)) {
        collections[record.id] = { ...record, data: { ...record.data, children: [] } };
      }
    });

    records.forEach((record) => {
      if (isApiRequest(record)) {
        if (record.collectionId) {
          collections[record.collectionId].data.children.push(record);
        } else {
          requests.push(record);
        }
      }
    });

    const collectionRecords = Object.values(collections);
    const updatedRecords = [...collectionRecords, ...requests];

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
      collections: updatedRecords.slice(0, collectionRecords.length) as RQAPI.CollectionRecord[],
      requests: updatedRecords.slice(collectionRecords.length) as RQAPI.ApiRecord[],
    };
  }, []);

  const updatedRecords = useMemo(() => prepareRecordsToRender(apiClientRecords), [
    apiClientRecords,
    prepareRecordsToRender,
  ]);

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
                return <CollectionRow key={record.id} record={record} onNewClick={onNewClick} />;
              })}

              {isNewRecordNameInputVisible && recordTypeToBeCreated === RQAPI.RecordType.COLLECTION ? (
                <NewRecordNameInput
                  recordType={recordTypeToBeCreated}
                  analyticEventSource="api_client_sidebar_header"
                  onSuccess={() => hideNewRecordNameInput()}
                />
              ) : null}

              {updatedRecords.requests.map((record) => {
                return <RequestRow key={record.id} record={record} />;
              })}

              {isNewRecordNameInputVisible && recordTypeToBeCreated === RQAPI.RecordType.API ? (
                <NewRecordNameInput
                  recordType={recordTypeToBeCreated}
                  analyticEventSource="api_client_sidebar_header"
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
    </>
  );
};
