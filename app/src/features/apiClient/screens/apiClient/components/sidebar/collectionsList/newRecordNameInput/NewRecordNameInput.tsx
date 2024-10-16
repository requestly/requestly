import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RQAPI } from "features/apiClient/types";
import { Input } from "antd";
import { upsertApiRecord } from "backend/apiClient";
import { getUserAuthDetails } from "store/selectors";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { useApiClientContext } from "features/apiClient/contexts";
import { toast } from "utils/Toast";
import { LoadingOutlined } from "@ant-design/icons";
import { getEmptyAPIEntry } from "features/apiClient/screens/apiClient/utils";
import { redirectToRequest } from "utils/RedirectionUtils";
import "./newRecordNameInput.scss";

export interface NewRecordNameInputProps {
  recordToBeEdited?: RQAPI.Record;
  newRecordCollectionId?: string;
  recordType: RQAPI.RecordType;
  onSuccess: () => void;
}

export const NewRecordNameInput: React.FC<NewRecordNameInputProps> = ({
  recordToBeEdited,
  recordType,
  onSuccess,
  newRecordCollectionId,
}) => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;
  const { onSaveRecord } = useApiClientContext();

  const [recordName, setRecordName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!recordToBeEdited;

  const defaultRecordName = recordType === RQAPI.RecordType.API ? "Untitled request" : "New collection";

  useEffect(() => {
    const updatedName = recordToBeEdited?.name || defaultRecordName;

    setRecordName(updatedName);
  }, [recordToBeEdited?.name, recordType, defaultRecordName]);

  /**
   * TODO:
   *
   * - make the network request and create or update the collection
   * - update the local state
   * - remove the collection and request row into seperate component [DONE]
   * - update collection icon
   * - open newly created collection in expanded form
   * - remove reusable function to create an empty request and saved in DB
   *
   * [NOWWWWWW]
   * - rename error [DONE]
   * - render the collections and requests in nested way [DONE]
   * - delete the collections
   * - add plus button on collection row to add a request
   *
   * - create request inside the collection
   * - delete bulk records
   *
   */

  const saveNewRecord = useCallback(async () => {
    setIsLoading(true);

    if (!uid || !recordName) {
      return;
    }

    const record: Partial<RQAPI.Record> = {
      name: recordName || defaultRecordName,
    };

    if (recordType === RQAPI.RecordType.API) {
      record.type = RQAPI.RecordType.API;
      record.data = getEmptyAPIEntry();
    } else {
      record.type = RQAPI.RecordType.COLLECTION;
      record.data = {};
    }

    if (newRecordCollectionId) {
      record.collectionId = newRecordCollectionId;
    }

    const result = await upsertApiRecord(uid, record, teamId);

    if (result.success) {
      onSaveRecord(result.data);

      if (recordType === RQAPI.RecordType.API) {
        redirectToRequest(navigate, result.data.id);
      }

      const toastSuccessMessage = recordType === RQAPI.RecordType.API ? "Request created!" : "Collection Created!";
      toast.success(toastSuccessMessage);
    } else {
      toast.error("Something went wrong!");
    }

    setIsLoading(false);
    onSuccess?.();
  }, [recordType, recordName, uid, teamId, onSaveRecord, defaultRecordName]);

  useEffect(() => {
    if (isEditMode) {
      return;
    }

    saveNewRecord();
  }, [saveNewRecord, isEditMode]);

  const updateRecord = useCallback(async () => {
    setIsLoading(true);

    if (!uid) {
      return;
    }

    if (!recordName || recordName === recordToBeEdited.name) {
      setIsLoading(false);
      onSuccess?.();
      return;
    }

    const record: Partial<RQAPI.Record> = {
      ...recordToBeEdited,
      name: recordName,
    };

    const result = await upsertApiRecord(uid, record, teamId);

    if (result.success) {
      onSaveRecord(result.data);

      if (recordType === RQAPI.RecordType.API) {
        redirectToRequest(navigate, result.data.id);
      }

      const toastSuccessMessage = recordType === RQAPI.RecordType.API ? "Request updated!" : "Collection updated!";
      toast.success(toastSuccessMessage);
    } else {
      toast.error("Something went wrong!");
    }

    setIsLoading(false);
    onSuccess?.();
  }, [recordType, recordToBeEdited, recordName, uid, teamId, onSaveRecord]);

  const onBlur = isEditMode ? updateRecord : saveNewRecord;

  return (
    <div className="new-record-input-container">
      {isLoading ? (
        <div className="new-record-input-placeholder">
          {recordName || defaultRecordName} <LoadingOutlined />
        </div>
      ) : (
        <Input
          autoFocus
          value={recordName}
          onBlur={onBlur}
          onPressEnter={onBlur}
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
