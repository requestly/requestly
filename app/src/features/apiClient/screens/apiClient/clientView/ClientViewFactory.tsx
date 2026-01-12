import { RQAPI } from "features/apiClient/types";
import HttpClientView, { HttpClientViewProps } from "../components/views/http/HttpClientView";
import GraphQLClientView, { GraphQLClientViewProps } from "../components/views/graphql/GraphQLClientView";
import { BufferedGraphQLRecordEntity, BufferedHttpRecordEntity } from "features/apiClient/slices/entities";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";

interface Props {
  entity: BufferedHttpRecordEntity | BufferedGraphQLRecordEntity;
  handleRequestFinished: (entry: RQAPI.ApiEntry) => void;
  isOpenInModal?: boolean;
  override?: HttpClientViewProps["override"] | GraphQLClientViewProps["override"];
}

export const ClientViewFactory = ({ entity, handleRequestFinished, isOpenInModal, override }: Props) => {
  if (entity.type === ApiClientEntityType.HTTP_RECORD) {
    return (
      <HttpClientView
        entity={entity}
        notifyApiRequestFinished={handleRequestFinished}
        openInModal={isOpenInModal}
        override={override as HttpClientViewProps["override"]}
      />
    );
  }

  if (entity.type === ApiClientEntityType.GRAPHQL_RECORD) {
    return (
      <GraphQLClientView
        entity={entity}
        notifyApiRequestFinished={handleRequestFinished}
        openInModal={isOpenInModal}
        override={override as GraphQLClientViewProps["override"]}
      />
    );
  }

  return "Not found";
  // return (
  //   <HttpClientView
  //     apiEntryDetails={apiRecord as RQAPI.HttpApiRecord}
  //     notifyApiRequestFinished={handleRequestFinished}
  //     onSaveCallback={onSaveCallback}
  //     isCreateMode={isCreateMode}
  //     openInModal={isOpenInModal}
  //   />
  // );
};
