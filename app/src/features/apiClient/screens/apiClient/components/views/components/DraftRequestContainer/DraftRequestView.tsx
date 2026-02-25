import React, { useCallback } from "react";
import { RQAPI } from "features/apiClient/types";
import { useHostContext } from "hooks/useHostContext";
import { EntityNotFound } from "features/apiClient/slices";
import { useOriginUndefinedBufferedEntity } from "features/apiClient/slices/entities/hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { NativeError } from "errors/NativeError";
import {
  GenericApiClient,
  GenericApiClientOverride,
} from "features/apiClient/screens/apiClient/clientView/GenericApiClient";

export const DraftRequestView: React.FC<{
  onSaveCallback: (apiEntryDetails: RQAPI.ApiRecord) => void;
}> = ({ onSaveCallback }) => {
  const bufferId = useHostContext().getBufferId();
  if (!bufferId) {
    throw new EntityNotFound("buffer_id", "buffer");
  }

  const scratchBuffer = useOriginUndefinedBufferedEntity<
    ApiClientEntityType.HTTP_RECORD | ApiClientEntityType.GRAPHQL_RECORD
  >({
    bufferId,
  });

  const handleRecordNameUpdate = useCallback(
    async (name: string) => {
      scratchBuffer.setName(name);
    },
    [scratchBuffer]
  );

  const save = useCallback(
    async (record: RQAPI.ApiRecord, repositories: ApiClientRepositoryInterface): Promise<RQAPI.ApiRecord> => {
      const result = await repositories.apiClientRecordsRepository.createRecord(record);
      if (!result.success) {
        throw new NativeError(result.message || "Could not save request!");
      }
      return result.data as RQAPI.ApiRecord;
    },
    []
  );

  const override: GenericApiClientOverride = {
    handleNameChange: handleRecordNameUpdate,
    onSaveClick: {
      save,
      onSuccess: onSaveCallback,
    },
  };

  return (
    <GenericApiClient override={override} entity={scratchBuffer} handleAppRequestFinished={() => {}} isDraftMode />
  );
};
