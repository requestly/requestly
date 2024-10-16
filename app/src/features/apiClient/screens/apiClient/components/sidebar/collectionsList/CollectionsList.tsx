import React from "react";
import { RQAPI } from "features/apiClient/types";
import { Typography } from "antd";
import { useApiClientContext } from "features/apiClient/contexts";
import { EmptyState } from "../emptyState/EmptyState";
import { NewRecordNameInput } from "./newRecordNameInput/NewRecordNameInput";
import { CollectionRow } from "./collectionRow/CollectionRow";
import { RequestRow } from "./requestRow/RequestRow";
import "./collectionsList.scss";

interface Props {
  newRecordCollectionId: string;
  isNewRecordNameInputVisible: boolean;
  recordTypeToBeCreated: RQAPI.RecordType;
  hideNewRecordNameInput: () => void;
  handleNewRecordClick: (recordType: RQAPI.RecordType) => void;
}

export const CollectionsList: React.FC<Props> = ({
  newRecordCollectionId,
  recordTypeToBeCreated,
  isNewRecordNameInputVisible,
  hideNewRecordNameInput,
  handleNewRecordClick,
}) => {
  const { isLoadingApiClientRecords, apiClientRecords } = useApiClientContext();

  return (
    <>
      <div className="collections-list-container">
        <div className="collections-list-content">
          {isLoadingApiClientRecords ? (
            <div className="api-client-sidebar-placeholder">
              <Typography.Text type="secondary">Loading...</Typography.Text>
            </div>
          ) : apiClientRecords.length > 0 ? (
            <div className="collections-list">
              {apiClientRecords.map((record) => {
                if (record.type === RQAPI.RecordType.COLLECTION) {
                  return <CollectionRow record={record} createNewRecord={handleNewRecordClick} />;
                }

                return <RequestRow record={record} />;
              })}
            </div>
          ) : (
            <EmptyState
              message="No collections created yet"
              newRecordBtnText="New collection"
              onNewRecordClick={() => {
                handleNewRecordClick(RQAPI.RecordType.COLLECTION);
              }}
            />
          )}
        </div>

        {isNewRecordNameInputVisible ? (
          <NewRecordNameInput
            newRecordCollectionId={newRecordCollectionId}
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
