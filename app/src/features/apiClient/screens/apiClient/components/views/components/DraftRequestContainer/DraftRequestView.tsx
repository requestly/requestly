import React, { useCallback } from "react";
import { RQAPI } from "features/apiClient/types";
import { useHostContext } from "hooks/useHostContext";
import {
  bufferActions,
  EntityNotFound,
  useApiClientRepository,
  useApiClientStore,
  useApiClientFeatureContext,
} from "features/apiClient/slices";
import { useOriginUndefinedBufferedEntity } from "features/apiClient/slices/entities/hooks";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";
import { notification } from "antd";
import { ApiClientRepositoryInterface } from "features/apiClient/helpers/modules/sync/interfaces";
import { NativeError } from "errors/NativeError";
import {
  GenericApiClient,
  GenericApiClientOverride,
} from "features/apiClient/screens/apiClient/clientView/GenericApiClient";
import { useApiClientDispatch } from "features/apiClient/slices/hooks/base.hooks";
import { ApiClientEntity } from "features/apiClient/slices/entities";
import { apiRecordsRankingManager } from "features/apiClient/helpers/RankingManager";

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

  const repositories = useApiClientRepository();
  const store = useApiClientStore();
  const dispatch = useApiClientDispatch();
  const context = useApiClientFeatureContext();

  const handleRecordNameUpdate = useCallback(
    async (name: string) => {
      const scratchRecord = scratchBuffer.getEntityFromState(store.getState());

      // Generate rank for the new record
      const collectionId = scratchRecord.collectionId || "";
      const rank = apiRecordsRankingManager.getRanksForNewApis(context, collectionId, [scratchRecord])[0];

      const dataToSave: Partial<RQAPI.ApiRecord> = {
        ...scratchRecord,
        name,
        rank,
      };
      const result = await repositories.apiClientRecordsRepository.createRecord(dataToSave);
      if (!result.success) {
        notification.error({
          message: "Could not rename record",
          description: result?.message,
          placement: "bottomRight",
        });
        return;
      }

      (scratchBuffer.origin as ApiClientEntity<RQAPI.ApiClientRecord>).upsert(result.data);
      dispatch(
        bufferActions.markSaved({
          id: scratchBuffer.id,
          savedData: result.data,
          referenceId: result.data.id,
        })
      );
      onSaveCallback(result.data as RQAPI.ApiRecord);
    },
    [scratchBuffer, repositories, store, onSaveCallback, dispatch]
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

  return <GenericApiClient override={override} entity={scratchBuffer} handleAppRequestFinished={() => {}} />;
};
