import { RQAPI } from "features/apiClient/types";
import { isGraphQLApiRecord, isHttpApiRecord } from "../utils";
import GraphQLClientView from "../components/views/graphql/GraphQLClientView";
import HttpClientView from "../components/views/http/HttpClientView";
import { HttpClientViewCreateMode } from "../components/views/http/HttpClientViewCreateMode";
import { BufferedGraphQLRecordEntity, BufferedHttpRecordEntity } from "features/apiClient/slices/entities";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";

interface Props {
  entity: BufferedHttpRecordEntity | BufferedGraphQLRecordEntity,
  // entityType: ApiClientEntityType.HTTP_RECORD | ApiClientEntityType.HTTP_RECORD,
  // apiRecord: RQAPI.ApiRecord;
  handleRequestFinished: (entry: RQAPI.ApiEntry) => void;
  onSaveCallback: (apiEntryDetails: RQAPI.ApiRecord) => void;
  // isCreateMode: boolean;
  isOpenInModal?: boolean;
}

export const ClientViewFactory = ({
  entity,
  // entityType
  // apiRecord,
  handleRequestFinished,
  onSaveCallback,
  // isCreateMode,
  isOpenInModal,
}: Props) => {
  if (entity.type === ApiClientEntityType.HTTP_RECORD) {
    // if (isCreateMode) {
    //   return (
    //     <HttpClientViewCreateMode
    //       apiEntryDetails={apiRecord as RQAPI.HttpApiRecord}
    //       onSaveCallback={onSaveCallback}
    //       openInModal={isOpenInModal}
    //       notifyApiRequestFinished={handleRequestFinished}
    //     />
    //   );
    // }

    return (
      <HttpClientView
        entity={entity}
        // apiEntryDetails={apiRecord}
        notifyApiRequestFinished={handleRequestFinished}
        onSaveCallback={onSaveCallback}
        // isCreateMode={isCreateMode}
        openInModal={isOpenInModal}
      />
    );
  }

  return 'wtf!';

  // if (isGraphQLApiRecord(apiRecord)) {
  //   return (
  //     <GraphQLClientView
  //       recordId={apiRecord.id}
  //       apiEntryDetails={apiRecord}
  //       notifyApiRequestFinished={handleRequestFinished}
  //       onSaveCallback={onSaveCallback}
  //       isCreateMode={isCreateMode}
  //       openInModal={isOpenInModal}
  //     />
  //   );
  // }

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
