import { RQAPI } from "../types";

export type BaseApiRecordState<
  TRequest = RQAPI.HttpRequest | RQAPI.GraphQLRequest,
  TResponse = RQAPI.HttpResponse | RQAPI.GraphQLResponse,
  TAdditionalData = {}
> = {
  record: RQAPI.RecordMetadata & {
    data: RQAPI.ApiEntryMetaData & {
      request: TRequest;
      response: TResponse;
    } & TAdditionalData;
  };
  updateRecordName: (name: string) => void;
  updateRecordRequest: (patch: Partial<TRequest>) => void;
  updateRecordResponse: (response: TResponse) => void;
  updateRecordAuth: (auth: RQAPI.Auth) => void;
  updateRecordScripts: (scripts: RQAPI.ApiEntryMetaData["scripts"]) => void;
};
