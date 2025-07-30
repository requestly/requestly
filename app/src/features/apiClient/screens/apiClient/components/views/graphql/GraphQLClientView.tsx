import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { RQAPI } from "features/apiClient/types";
import GraphQLClientUrl from "./components/GraphQLClientUrl/GraphQLClientUrl";
import { useCallback, useMemo, useState } from "react";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";
import { OperationEditor } from "./components/GraphQLEditor/components/OperationEditor/OperationEditor";
import { VariablesEditor } from "./components/GraphQLEditor/components/VariablesEditor/VariablesEditor";
import { RQButton } from "lib/design-system-v2/components";
import { useApiClientContext } from "features/apiClient/contexts";
import { toast } from "utils/Toast";

interface Props {
  notifyApiRequestFinished: (entry: RQAPI.GraphQLApiEntry) => void;
  onSaveCallback: (apiEntryDetails: RQAPI.GraphQLApiRecord) => void;
  isCreateMode: boolean;
}

export const GraphQLClientView = ({ notifyApiRequestFinished, onSaveCallback, isCreateMode }: Props) => {
  const [url, collectionId, updateRecordRequest, getRecord] = useGraphQLRecordStore((state) => [
    state.record.data.request.url,
    state.record.collectionId,
    state.updateRecordRequest,
    state.getRecord,
  ]);
  const { apiClientRecordsRepository, onSaveRecord } = useApiClientContext();
  const { getVariablesWithPrecedence } = useEnvironmentManager();

  const [isSaving, setIsSaving] = useState(false);

  const currentEnvironmentVariables = useMemo(
    () => getVariablesWithPrecedence(collectionId),
    [collectionId, getVariablesWithPrecedence]
  );

  const handleUrlChange = useCallback(
    (value: string) => {
      updateRecordRequest({
        url: value,
      });
    },
    [updateRecordRequest]
  );

  // TEMP IMPLEMENTATION
  const handleSave = useCallback(async () => {
    const apiRecord = getRecord();

    const recordToSave: Partial<RQAPI.ApiRecord> = {
      type: RQAPI.RecordType.API,
      data: {
        ...apiRecord.data,
      },
    };
    if (isCreateMode) {
      const requestId = apiClientRecordsRepository.generateApiRecordId();
      recordToSave.id = requestId;
    }

    if (apiRecord?.id) {
      recordToSave.id = apiRecord?.id;
    }
    setIsSaving(true);
    const result = isCreateMode
      ? await apiClientRecordsRepository.createRecordWithId(recordToSave, recordToSave.id)
      : await apiClientRecordsRepository.updateRecord(recordToSave, recordToSave.id);

    if (result.success && result.data.type === RQAPI.RecordType.API) {
      onSaveRecord({ ...(apiRecord ?? {}), ...result.data, data: { ...result.data.data, ...recordToSave.data } });
      onSaveCallback(result.data as RQAPI.GraphQLApiRecord);
      toast.success("Request saved!");
    } else {
      toast.error("Something went wrong while saving the request");
    }
    setIsSaving(false);
  }, [onSaveCallback, getRecord, isCreateMode, apiClientRecordsRepository, onSaveRecord]);

  const handleUrlInputEnterPressed = useCallback((evt: KeyboardEvent) => {
    (evt.target as HTMLInputElement).blur();
  }, []);

  return (
    <div className="api-client-view">
      <GraphQLClientUrl
        url={url}
        currentEnvironmentVariables={currentEnvironmentVariables}
        onEnterPress={handleUrlInputEnterPressed}
        onUrlChange={handleUrlChange}
      />
      <OperationEditor />
      <VariablesEditor />
      <RQButton loading={isSaving} onClick={handleSave}>
        Save
      </RQButton>
    </div>
  );
};
