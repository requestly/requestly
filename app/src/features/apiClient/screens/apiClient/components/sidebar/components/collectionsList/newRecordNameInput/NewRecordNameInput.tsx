import React, { useCallback, useState } from "react";
import { RQAPI } from "features/apiClient/types";
import { Input } from "antd";
import { toast } from "utils/Toast";
import { LoadingOutlined } from "@ant-design/icons";
import "./newRecordNameInput.scss";
import { trackCollectionRenamed, trackRequestRenamed } from "modules/analytics/events/features/apiClient";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { useCommand } from "features/apiClient/commands";
import { useNewApiClientContext } from "features/apiClient/hooks/useNewApiClientContext";
import { useApiClientRepository } from "features/apiClient/contexts/meta";

export interface NewRecordNameInputProps {
  recordToBeEdited: RQAPI.ApiClientRecord;
  recordType: RQAPI.RecordType;
  onSuccess: () => void;
  analyticEventSource: RQAPI.AnalyticsEventSource;
}

export const NewRecordNameInput: React.FC<NewRecordNameInputProps> = ({ recordToBeEdited, recordType, onSuccess }) => {
  const { onSaveRecord } = useNewApiClientContext();
  const { apiClientRecordsRepository } = useApiClientRepository();
  const {
    api: { forceRefreshRecords: forceRefreshApiClientRecords },
  } = useCommand();
  const [updateTabBySource, closeTabBySource] = useTabServiceWithSelector((state) => [
    state.updateTabBySource,
    state.closeTabBySource,
  ]);

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
        ? await apiClientRecordsRepository.updateRecord(record, record.id!)
        : await apiClientRecordsRepository.renameCollection(record.id!, record.name!);

    if (result.success) {
      const tabSourceName = record.type === RQAPI.RecordType.API ? "request" : "collection";
      onSaveRecord(result.data);
      updateTabBySource(result.data.id, tabSourceName, { title: result.data.name });

      const wasForceRefreshed = await forceRefreshApiClientRecords();
      if (wasForceRefreshed && recordType === RQAPI.RecordType.COLLECTION) {
        closeTabBySource(record.id!, "collection", true);
      }

      if (recordType === RQAPI.RecordType.API) {
        trackRequestRenamed("api_client_sidebar");
      } else {
        trackCollectionRenamed();
      }

      const toastSuccessMessage = recordType === RQAPI.RecordType.API ? "Request updated!" : "Collection updated!";
      toast.success(toastSuccessMessage);
    } else {
      toast.error(result?.message || "Something went wrong!");
    }

    setIsLoading(false);
    onSuccess?.();
  }, [
    recordType,
    recordToBeEdited,
    recordName,
    onSaveRecord,
    onSuccess,
    apiClientRecordsRepository,
    forceRefreshApiClientRecords,
    closeTabBySource,
    updateTabBySource,
  ]);

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
