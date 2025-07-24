import { useGraphQLRecordStore } from "features/apiClient/hooks/useGraphQLRecordStore";
import { RQAPI } from "features/apiClient/types";

interface Props {
  notifyApiRequestFinished: (entry: RQAPI.GraphQLApiEntry) => void;
  onSaveCallback: (apiEntryDetails: RQAPI.GraphQLApiRecord) => void;
  isCreateMode: boolean;
}

export const GraphQLClientView = ({ notifyApiRequestFinished, onSaveCallback, isCreateMode }: Props) => {
  const [record] = useGraphQLRecordStore((state) => [state.record]);
  console.log("GQL record", record);
  return <div className="api-client-view">GraphQL Client here</div>;
};
