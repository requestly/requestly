import React, { useCallback } from "react";
import { RQAPI } from "features/apiClient/types";
import { useHostContext } from "hooks/useHostContext";
import { bufferActions, EntityNotFound, useApiClientRepository, useApiClientStore } from "features/apiClient/slices";
import { useOriginUndefinedBufferedEntity } from "features/apiClient/slices/entities/hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { notification } from "antd";
import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { NativeError } from "errors/NativeError";
import { GenericApiClient } from "features/apiClient/screens/apiClient/clientView/GenericApiClient";
import { useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";

export const DraftRequestView: React.FC<{
  onSaveCallback: (apiEntryDetails: RQAPI.ApiRecord) => void;
  // apiEntryType: RQAPI.ApiEntryType;
}> = ({ onSaveCallback }) => {
  const bufferId = useHostContext().getBufferId();
  if (!bufferId) {
    throw new EntityNotFound('buffer_id', 'buffer');
  }
  const scratchBuffer = useOriginUndefinedBufferedEntity<ApiClientEntityType.HTTP_RECORD>({
    bufferId
  });

  const repositories = useApiClientRepository();
  const store = useApiClientStore();
  const dispatch = useApiClientDispatch();

  const handleRecordNameUpdate = useCallback(async (name: string) => {
    const scratchRecord = scratchBuffer.getEntityFromState(store.getState());
    const dataToSave: Partial<RQAPI.ApiRecord> = {
      ...scratchRecord,
      name
    }
    const result = await repositories.apiClientRecordsRepository.createRecord(dataToSave);
    if (!result.success) {
      notification.error({
        message: "Could not rename record",
        description: result?.message,
        placement: "bottomRight",
      });
      return;
    }
    scratchBuffer.origin.upsert(result.data as RQAPI.HttpApiRecord);
    dispatch(bufferActions.markSaved({
      id: scratchBuffer.id,
      savedData: result.data,
      referenceId: result.data.id,
    }));
    onSaveCallback(result.data as RQAPI.ApiRecord);
  }, [scratchBuffer, repositories, store, onSaveCallback, dispatch]);

  const save = useCallback(async (record: RQAPI.HttpApiRecord, repositories: ApiClientRepositoryInterface) => {
    const result = await repositories.apiClientRecordsRepository.createRecord(record);
    if (!result.success) {
      throw new NativeError(result.message || "Could not save request!");
    }
    return result.data as RQAPI.HttpApiRecord;

  }, []);

  // const apiEntryDetails: RQAPI.ApiRecord = useMemo(() => getEmptyDraftApiRecord(apiEntryType), [apiEntryType]);
  return (
    // <HttpClientView
    //   notifyApiRequestFinished={() => {}}
    //   entity={scratchBuffer}
    //   override={{
    //   handleNameChange: handleRecordNameUpdate,

    //   onSaveClick: {
    //     save,
    //     onSuccess: onSaveCallback,
    //   }
    // }}
    // />
    <GenericApiClient
      // isCreateMode
      // onSaveCallback={onSaveCallback}
      override={{
        handleNameChange: handleRecordNameUpdate,

        onSaveClick: {
          save,
          onSuccess: onSaveCallback,
        }
      }}

      entity={scratchBuffer}
      handleAppRequestFinished={() => { }}
    />
  );
};
