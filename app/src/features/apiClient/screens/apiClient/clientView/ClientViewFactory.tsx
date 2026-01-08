import { RQAPI } from "features/apiClient/types";
import HttpClientView, { HttpClientViewProps } from "../components/views/http/HttpClientView";
import { BufferedGraphQLRecordEntity, BufferedHttpRecordEntity } from "features/apiClient/slices/entities";
import { ApiClientEntityType } from "features/apiClient/slices/entities/types";

interface Props {
  entity: BufferedHttpRecordEntity | BufferedGraphQLRecordEntity,
  handleRequestFinished: (entry: RQAPI.ApiEntry) => void;
  isOpenInModal?: boolean;
  override?: HttpClientViewProps['override'],
}

export const ClientViewFactory = ({
  entity,
  handleRequestFinished,
  isOpenInModal,
  override,
}: Props) => {
  if (entity.type === ApiClientEntityType.HTTP_RECORD) {
    return (
      <HttpClientView
        entity={entity}
        notifyApiRequestFinished={handleRequestFinished}
        openInModal={isOpenInModal}
        override={override}
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
