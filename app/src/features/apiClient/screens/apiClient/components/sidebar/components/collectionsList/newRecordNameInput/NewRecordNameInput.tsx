import React, { useCallback, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { Input } from "antd";
import { toast } from "utils/Toast";
import { LoadingOutlined } from "@ant-design/icons";
import { trackCollectionRenamed, trackRequestRenamed } from "modules/analytics/events/features/apiClient";
import { useNewApiClientContext } from "features/apiClient/hooks/useNewApiClientContext";
import { useApiClientRepository } from "features/apiClient/slices";
import "./newRecordNameInput.scss";

export interface NewRecordNameInputProps {
  recordToBeEdited: RQAPI.ApiClientRecord;
  recordType: RQAPI.RecordType;
  onSuccess: () => void;
  analyticEventSource: RQAPI.AnalyticsEventSource;
}

export const NewRecordNameInput: React.FC<NewRecordNameInputProps> = ({ recordToBeEdited, recordType, onSuccess }) => {
  const { onSaveRecord } = useNewApiClientContext();
  const { apiClientRecordsRepository } = useApiClientRepository();

  const defaultRecordName = recordType === RQAPI.RecordType.API ? "Untitled request" : "New collection";
  const [recordName, setRecordName] = useState(recordToBeEdited?.name || defaultRecordName);
  const [isLoading, setIsLoading] = useState(false);

  const updateRecord = useCallback(async () => {
    setIsLoading(true);

    if (!recordName || recordName === recordToBeEdited?.name) {
      setIsLoading(false);
      onSuccess?.();
      return;
    }

    const record: RQAPI.ApiClientRecord = {
      ...recordToBeEdited,
      name: recordName,
    };

    const result =
      record.type === RQAPI.RecordType.API
        ? await apiClientRecordsRepository.updateRecord(record, record.id)
        : record.type === RQAPI.RecordType.COLLECTION
        ? await apiClientRecordsRepository.renameCollection(record.id, record?.name)
        : await apiClientRecordsRepository.updateExampleRequest(record);

    if (result.success) {
      onSaveRecord(result.data);

      if (recordType === RQAPI.RecordType.API || recordType === RQAPI.RecordType.EXAMPLE_API) {
        trackRequestRenamed("api_client_sidebar");
      } else {
        trackCollectionRenamed();
      }

      let toastSuccessMessage;
      switch (recordType) {
        case RQAPI.RecordType.API:
          toastSuccessMessage = "Request updated!";
          break;
        case RQAPI.RecordType.COLLECTION:
          toastSuccessMessage = "Collection updated!";
          break;
        case RQAPI.RecordType.EXAMPLE_API:
          toastSuccessMessage = "Example updated!";
          break;
        default:
          toastSuccessMessage = "Record updated!";
          break;
      }
      toast.success(toastSuccessMessage);
    } else {
      toast.error(result?.message || "Something went wrong!");
    }

    setIsLoading(false);
    onSuccess?.();
  }, [recordType, recordToBeEdited, recordName, onSaveRecord, onSuccess, apiClientRecordsRepository]);

  return (
    <div className="new-record-input-container">
      {isLoading ? (
        <div className="new-record-input-placeholder">
          <div className="record-name">{recordName || defaultRecordName}</div>
          <LoadingOutlined />
        </div>
      ) : (
        <Input
          autoFocus
          value={recordName}
          onBlur={updateRecord}
          onPressEnter={updateRecord}
          className="new-record-input"
          status={recordName.length === 0 ? "error" : ""}
          onChange={(e) => {
            setRecordName(e.target.value);
          }}
        />
      )}
    </div>
  );
};
