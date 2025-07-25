import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { RQAPI } from "features/apiClient/types";
import GraphQLClientUrl from "./components/GraphQLClientUrl/GraphQLClientUrl";
import { useCallback, useMemo } from "react";
import useEnvironmentManager from "backend/environment/hooks/useEnvironmentManager";

interface Props {
  notifyApiRequestFinished: (entry: RQAPI.GraphQLApiEntry) => void;
  onSaveCallback: (apiEntryDetails: RQAPI.GraphQLApiRecord) => void;
  isCreateMode: boolean;
}

export const GraphQLClientView = ({ notifyApiRequestFinished, onSaveCallback, isCreateMode }: Props) => {
  const [url, collectionId, updateRecordRequest] = useGraphQLRecordStore((state) => [
    state.record.data.request.url,
    state.record.collectionId,
    state.updateRecordRequest,
  ]);
  const { getVariablesWithPrecedence } = useEnvironmentManager();

  const currentEnvironmentVariables = useMemo(() => getVariablesWithPrecedence(collectionId), [
    collectionId,
    getVariablesWithPrecedence,
  ]);

  const handleUrlChange = useCallback(
    (value: string) => {
      updateRecordRequest({
        url: value,
      });
    },
    [updateRecordRequest]
  );

  const handleUrlInputEnterPressed = useCallback((evt: KeyboardEvent) => {
    (evt.target as HTMLInputElement).blur();
  }, []);

  console.log("GQL url", url);

  return (
    <div className="api-client-view">
      <GraphQLClientUrl
        url={url}
        currentEnvironmentVariables={currentEnvironmentVariables}
        onEnterPress={handleUrlInputEnterPressed}
        onUrlChange={handleUrlChange}
      />
    </div>
  );
};
