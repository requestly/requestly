import { KeyValuePair, RequestContentType, RequestMethod, RQAPI } from "features/apiClient/types";
import { UpdateCommand } from "../types";
import { apiRecordsActions } from "../apiRecords/slice";
import { selectRecordById } from "../apiRecords/selectors";
import { ApiClientRootState } from "../hooks/types";
import { RequestEntity } from "./request";
import { EntityType, SerializedEntity } from "./types";

export class HttpRecordEntity extends RequestEntity<RQAPI.HttpApiRecord> {
  readonly type = EntityType.HTTP_RECORD;

  protected dispatchCommand(command: UpdateCommand<RQAPI.HttpApiRecord>): void {
    this.dispatch(apiRecordsActions.applyPatch({ id: this.meta.id, command }));
  }

  getFromState(state: ApiClientRootState): RQAPI.HttpApiRecord | undefined {
    const record = selectRecordById(state, this.meta.id);
    if (record?.type !== RQAPI.RecordType.API) return undefined;
    if (record.data?.type !== RQAPI.ApiEntryType.HTTP) return undefined;
    return record as RQAPI.HttpApiRecord;
  }

  private getRequest(state: ApiClientRootState): RQAPI.HttpRequest | undefined {
    return this.getFromState(state)?.data?.request;
  }

  getResponse(state: ApiClientRootState): RQAPI.HttpResponse | undefined {
    return this.getFromState(state)?.data?.response;
  }

  getUrl(state: ApiClientRootState): string | undefined {
    return this.getRequest(state)?.url;
  }

  getMethod(state: ApiClientRootState): RequestMethod | undefined {
    return this.getRequest(state)?.method;
  }

  getHeaders(state: ApiClientRootState): KeyValuePair[] | undefined {
    return this.getRequest(state)?.headers;
  }

  getQueryParams(state: ApiClientRootState): KeyValuePair[] | undefined {
    return this.getRequest(state)?.queryParams;
  }

  getBody(state: ApiClientRootState): RQAPI.RequestBody | undefined {
    return this.getRequest(state)?.body;
  }

  getContentType(state: ApiClientRootState): RequestContentType | undefined {
    return this.getRequest(state)?.contentType;
  }

  getPathVariables(state: ApiClientRootState): RQAPI.PathVariable[] | undefined {
    return this.getRequest(state)?.pathVariables;
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

  serialize(): SerializedEntity<EntityType.HTTP_RECORD> {
    return { id: this.meta.id, type: this.type };
  }
}
