import { KeyValueDataType, KeyValuePair, RequestContentType, RequestMethod, RQAPI } from "features/apiClient/types";
import { InvalidEntityShape } from "../types";
import { selectRecordById } from "../apiRecords/selectors";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { ApiClientRecordEntity } from "./api-client-record-entity";
import { ApiClientEntityType } from "./types";
import { ApiClientEntityMeta } from "./base";
import { supportsRequestBody } from "features/apiClient/screens/apiClient/utils";
import { CONTENT_TYPE_HEADER } from "features/apiClient/constants";

export class HttpRecordEntity<
  M extends ApiClientEntityMeta = ApiClientEntityMeta,
  R extends RQAPI.HttpApiRecord | RQAPI.HttpExampleApiRecord = RQAPI.HttpApiRecord
> extends ApiClientRecordEntity<R, M> {
  readonly type = ApiClientEntityType.HTTP_RECORD;
  getEntityFromState(state: ApiClientStoreState): R {
    const record = selectRecordById(state, this.meta.id);
    if (record?.type !== RQAPI.RecordType.API) {
      throw new InvalidEntityShape({
        id: this.id,
        expectedType: RQAPI.RecordType.API,
        foundType: record?.type,
      });
    }
    const entryType = record.data?.type;
    if (entryType && entryType !== RQAPI.ApiEntryType.HTTP) {
      throw new InvalidEntityShape({
        id: this.id,
        expectedType: RQAPI.ApiEntryType.HTTP,
        foundType: entryType,
      });
    }
    return record as R;
  }

  getRequest(state: ApiClientStoreState) {
    return this.getEntityFromState(state).data.request;
  }

  getResponse(state: ApiClientStoreState) {
    return this.getEntityFromState(state).data.response;
  }

  getUrl(state: ApiClientStoreState): string {
    return this.getRequest(state).url;
  }

  getMethod(state: ApiClientStoreState): RequestMethod {
    return this.getRequest(state).method;
  }

  getHeaders(state: ApiClientStoreState): KeyValuePair[] {
    return this.getRequest(state).headers;
  }

  getQueryParams(state: ApiClientStoreState) {
    return this.getRequest(state).queryParams;
  }

  getBody(state: ApiClientStoreState) {
    return this.getRequest(state).body;
  }

  getContentType(state: ApiClientStoreState) {
    return this.getRequest(state).contentType;
  }

  getPathVariables(state: ApiClientStoreState) {
    return this.getRequest(state).pathVariables;
  }

  reconcilePathKeys(pathKeys: string[]) {
    this.unsafePatch((s) => {
      const existingPathVariables = s.data.request.pathVariables;
      if (!existingPathVariables) {
        for (const k of pathKeys) {
          this.addNewPathVariable(s, k);
        }

        return;
      }

      for (const sourceKey of pathKeys) {
        if (!existingPathVariables.find((v) => v.key === sourceKey)) {
          this.addNewPathVariable(s, sourceKey);
        }
      }

      for (const existingKey of existingPathVariables.map((v) => v.key)) {
        if (!pathKeys.includes(existingKey)) {
          this.deletePathVariable(s, existingKey);
        }
      }
    });
  }

  addNewPathVariable(state: R, key: string) {
    if (!state.data.request.pathVariables) {
      state.data.request.pathVariables = [];
    }
    const existingPathVariables = state.data.request.pathVariables;
    existingPathVariables.push({
      id: Date.now(),
      key,
      value: "",
      description: "",
      dataType: KeyValueDataType.STRING,
    });
  }

  deletePathVariable(state: R, key: string) {
    const existingPathVariables = state.data.request.pathVariables;
    if (!existingPathVariables) {
      return;
    }
    const index = existingPathVariables.findIndex((v) => v.key === key);
    if (index >= 0) {
      existingPathVariables.splice(index, 1);
    }
  }

  setPathVariable(key: string, patch: Omit<RQAPI.PathVariable, "id" | "key">) {
    this.unsafePatch((s) => {
      const existingPathVariables = s.data.request.pathVariables;
      if (!existingPathVariables) {
        return;
      }

      const index = existingPathVariables.findIndex((v) => v.key === key);
      if (index < 0) {
        return;
      }

      existingPathVariables[index] = {
        ...existingPathVariables[index]!,
        ...patch,
      };
    });
  }

  setUrl(url: string): void {
    this.SETCOMMON({ data: { request: { url } } });
  }

  setIncludeCredentials(includeCredentials: boolean) {
    this.SETCOMMON({
      data: {
        request: {
          includeCredentials,
        },
      },
    });
  }

  setMethod(method: RequestMethod): void {
    if (!supportsRequestBody(method)) {
      this.deleteBody();
      this.setContentType(RequestContentType.RAW);
      this.deleteHeader((header) => header.key === CONTENT_TYPE_HEADER);
    }
    this.SETCOMMON({ data: { request: { method } } });
  }

  setHeaders(headers: KeyValuePair[]): void {
    this.SETCOMMON({ data: { request: { headers } } });
  }

  setQueryParams(queryParams: KeyValuePair[]): void {
    this.SETCOMMON({ data: { request: { queryParams } } });
  }

  setBody(body: RQAPI.RequestBody): void {
    this.SETCOMMON({ data: { request: { body } } });
  }

  setContentType(contentType: RequestContentType): void {
    this.SETCOMMON({ data: { request: { contentType } } });
  }

  setPathVariables(pathVariables: RQAPI.PathVariable[]): void {
    this.SETCOMMON({ data: { request: { pathVariables } } });
  }

  deleteUrl(): void {
    this.DELETECOMMON({ data: { request: { url: null } } });
  }

  deleteBody(): void {
    this.DELETECOMMON({ data: { request: { body: null } } });
  }

  deleteHeader(predicate: (header: KeyValuePair) => boolean): void {
    this.unsafePatch((state) => {
      state.data.request.headers = state.data.request.headers.filter((header) => !predicate(header));
    });
  }

  setResponse(response: RQAPI.HttpResponse): void {
    this.SETCOMMON({ data: { response } });
  }

  setRequest(request: RQAPI.HttpRequest): void {
    this.unsafePatch((state) => {
      state.data.request = {
        ...request,
      };
    });
  }
}
