import { KeyValuePair, RequestContentType, RequestMethod, RQAPI } from "features/apiClient/types";
import { UpdateCommand } from "../types";
import { apiRecordsActions } from "../apiRecords/slice";
import { buffersActions } from "../buffers/slice";
import { BaseUpdater } from "./base";

export abstract class RequestUpdater<T extends RQAPI.ApiClientRecord> extends BaseUpdater<T> {
  setName(name: string): void {
    this.setCommon({ name });
  }

  setDescription(description: string): void {
    this.setCommon({ description });
  }

  setCollectionId(collectionId: string | null): void {
    this.setCommon({ collectionId });
  }

  deleteName(): void {
    this.deleteCommon({ name: null });
  }

  deleteDescription(): void {
    this.deleteCommon({ description: null });
  }

  setAuth(auth: RQAPI.Auth): void {
    this.setCommon({ data: { auth } });
  }

  deleteAuth(): void {
    this.deleteCommon({ data: { auth: null } });
  }

  setScripts(scripts: { preRequest?: string; postResponse?: string }): void {
    this.setCommon({ data: { scripts } });
  }

  setPreRequestScript(script: string): void {
    this.setCommon({ data: { scripts: { preRequest: script } } });
  }

  setPostResponseScript(script: string): void {
    this.setCommon({ data: { scripts: { postResponse: script } } });
  }
}

export class HttpRequestUpdater extends RequestUpdater<RQAPI.HttpApiRecord> {
  protected dispatchCommand(command: UpdateCommand<RQAPI.HttpApiRecord>): void {
    this.dispatch(apiRecordsActions.applyPatch({ id: this.meta.id, command }));
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

  deleteUrl(): void {
    this.DELETE({ data: { request: { url: null } } });
  }

  deleteBody(): void {
    this.DELETE({ data: { request: { body: null } } });
  }
}

export class HttpRequestBufferUpdater extends HttpRequestUpdater {
  protected dispatchCommand(command: UpdateCommand<RQAPI.HttpApiRecord>): void {
    const apiClientCommand: UpdateCommand<RQAPI.ApiClientRecord> = command;
    this.dispatch(buffersActions.applyPatch({ id: this.meta.id, command: apiClientCommand }));
  }
}

export class GraphQLRequestUpdater extends RequestUpdater<RQAPI.GraphQLApiRecord> {
  protected dispatchCommand(command: UpdateCommand<RQAPI.GraphQLApiRecord>): void {
    this.dispatch(apiRecordsActions.applyPatch({ id: this.meta.id, command }));
  }

  setUrl(url: string): void {
    this.SET({ data: { request: { url } } });
  }

  setHeaders(headers: KeyValuePair[]): void {
    this.SET({ data: { request: { headers } } });
  }

  setOperation(operation: string): void {
    this.SET({ data: { request: { operation } } });
  }

  setVariables(variables: string): void {
    this.SET({ data: { request: { variables } } });
  }

  setOperationName(operationName: string): void {
    this.SET({ data: { request: { operationName } } });
  }

  deleteOperation(): void {
    this.DELETE({ data: { request: { operation: null } } });
  }

  deleteVariables(): void {
    this.DELETE({ data: { request: { variables: null } } });
  }
}

export class GraphQLRequestBufferUpdater extends GraphQLRequestUpdater {
  protected dispatchCommand(command: UpdateCommand<RQAPI.GraphQLApiRecord>): void {
    const apiClientCommand: UpdateCommand<RQAPI.ApiClientRecord> = command;
    this.dispatch(buffersActions.applyPatch({ id: this.meta.id, command: apiClientCommand }));
  }
}
