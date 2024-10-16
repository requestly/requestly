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
  onNewClick: () => void;
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

    const updatedRecords = [...Object.values(collections), ...requests];
    updatedRecords.sort((recordA, recordB) => recordA.createdTs - recordB.createdTs);

    return updatedRecords;
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
          ) : updatedRecords.length > 0 ? (
            <div className="collections-list">
              {updatedRecords.map((record) => {
                if (record.type === RQAPI.RecordType.COLLECTION) {
                  return <CollectionRow record={record} onNewClick={onNewClick} />;
                }

                return <RequestRow record={record} />;
              })}
            </div>
          ) : (
            <ApiRecordEmptyState
              recordType={RQAPI.RecordType.COLLECTION}
              message="No collections created yet"
              newRecordBtnText="New collection"
              onNewRecordClick={onNewClick}
            />
          )}
        </div>

        {isNewRecordNameInputVisible ? (
          <NewRecordNameInput
            recordType={recordTypeToBeCreated}
            onSuccess={() => {
              hideNewRecordNameInput();
            }}
          />
        ) : null}
      </div>
    </>
  );
};
