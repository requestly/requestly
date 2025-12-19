import { KeyValuePair, RequestContentType, RequestMethod, RQAPI } from "features/apiClient/types";
import { InvalidEntityShape } from "../types";
import { selectRecordById } from "../apiRecords/selectors";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { ApiClientRecordEntity } from "./api-client-record-entity";
import { ApiClientEntityType } from "./types";

export class HttpRecordEntity extends ApiClientRecordEntity<RQAPI.HttpApiRecord> {
  readonly type = ApiClientEntityType.HTTP_RECORD;
  getEntityFromState(state: ApiClientStoreState): RQAPI.HttpApiRecord {
    const record = selectRecordById(state, this.meta.id);
    if (record?.type !== RQAPI.RecordType.API) {
      throw new InvalidEntityShape({
        id: this.id,
        expectedType: RQAPI.RecordType.API,
        foundType: record?.type,
      });
    }
    if (record.data?.type !== RQAPI.ApiEntryType.HTTP) {
      throw new InvalidEntityShape({
        id: this.id,
        expectedType: RQAPI.ApiEntryType.HTTP,
        foundType: record.data.type,
      });
    }
    return record as RQAPI.HttpApiRecord;
  }

  private getRequest(state: ApiClientStoreState): RQAPI.HttpRequest {
    return this.getEntityFromState(state).data.request;
  }

  getResponse(state: ApiClientStoreState): RQAPI.HttpResponse | undefined {
    return this.getEntityFromState(state).data.response;
  }

  getUrl(state: ApiClientStoreState): string | undefined {
    return this.getRequest(state).url;
  }

  getMethod(state: ApiClientStoreState): RequestMethod | undefined {
    return this.getRequest(state).method;
  }

  getHeaders(state: ApiClientStoreState): KeyValuePair[] | undefined {
    return this.getRequest(state).headers;
  }

  getQueryParams(state: ApiClientStoreState): KeyValuePair[] | undefined {
    return this.getRequest(state).queryParams;
  }

  getBody(state: ApiClientStoreState): RQAPI.RequestBody | undefined {
    return this.getRequest(state).body;
  }

  getContentType(state: ApiClientStoreState): RequestContentType | undefined {
    return this.getRequest(state).contentType;
  }

  getPathVariables(state: ApiClientStoreState): RQAPI.PathVariable[] | undefined {
    return this.getRequest(state).pathVariables;
  }

  setUrl(url: string): void {
    this.SET({ data: { request: { url } } });
  }

  setMethod(method: RequestMethod): void {
    this.SET({ data: { request: { method } } });
  }

  setHeaders(headers: KeyValuePair[]): void {
    this.SET({ data: { request: { headers } } });
  }

  setQueryParams(queryParams: KeyValuePair[]): void {
    this.SET({ data: { request: { queryParams } } });
  }

  setBody(body: RQAPI.RequestBody): void {
    this.SET({ data: { request: { body } } });
  }

  setContentType(contentType: RequestContentType): void {
    this.SET({ data: { request: { contentType } } });
  }

  setPathVariables(pathVariables: RQAPI.PathVariable[]): void {
    this.SET({ data: { request: { pathVariables } } });
  }

  deleteUrl(): void {
    this.DELETE({ data: { request: { url: null } } });
  }

  deleteBody(): void {
    this.DELETE({ data: { request: { body: null } } });
  }
}
