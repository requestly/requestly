import { Dispatch } from "@reduxjs/toolkit";
import { KeyValuePair, RequestContentType, RequestMethod, RQAPI } from "features/apiClient/types";
import { UpdateCommand } from "../types";
import { apiRecordsActions } from "../apiRecords/slice";
import { buffersActions } from "../buffers/slice";
import { BaseUpdater, UpdaterMeta } from "./base";

export class HttpRequestUpdater extends BaseUpdater<RQAPI.HttpApiRecord> {
  protected dispatchCommand(command: UpdateCommand<RQAPI.HttpApiRecord>): void {
    this.dispatch(apiRecordsActions.applyPatch({ id: this.meta.id, command }));
  }

  setName(name: string): void {
    this.SET({ name });
  }

  setDescription(description: string): void {
    this.SET({ description });
  }

  setCollectionId(collectionId: string | null): void {
    this.SET({ collectionId });
  }

  deleteName(): void {
    this.DELETE({ name: true });
  }

  deleteDescription(): void {
    this.DELETE({ description: true });
  }

  // ─── HTTP-Specific Methods ─────────────────────────────────────────────────

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

  setAuth(auth: RQAPI.Auth): void {
    this.SET({ data: { auth } });
  }

  setScripts(scripts: { preRequest?: string; postResponse?: string }): void {
    this.SET({ data: { scripts } });
  }

  setPreRequestScript(script: string): void {
    this.SET({ data: { scripts: { preRequest: script } } });
  }

  setPostResponseScript(script: string): void {
    this.SET({ data: { scripts: { postResponse: script } } });
  }

  deleteUrl(): void {
    this.DELETE({ data: { request: { url: true } } });
  }

  deleteBody(): void {
    this.DELETE({ data: { request: { body: true } } });
  }

  deleteAuth(): void {
    this.DELETE({ data: { auth: true } });
  }
}

export class HttpRequestBufferUpdater extends HttpRequestUpdater {
  protected dispatchCommand(command: UpdateCommand<RQAPI.HttpApiRecord>): void {
    const apiClientCommand: UpdateCommand<RQAPI.ApiClientRecord> = command;
    this.dispatch(buffersActions.applyPatch({ id: this.meta.id, command: apiClientCommand }));
  }
}

export class GraphQLRequestUpdater extends BaseUpdater<RQAPI.GraphQLApiRecord> {
  protected dispatchCommand(command: UpdateCommand<RQAPI.GraphQLApiRecord>): void {
    this.dispatch(apiRecordsActions.applyPatch({ id: this.meta.id, command }));
  }

  setName(name: string): void {
    this.SET({ name });
  }

  setDescription(description: string): void {
    this.SET({ description });
  }

  setCollectionId(collectionId: string | null): void {
    this.SET({ collectionId });
  }

  deleteName(): void {
    this.DELETE({ name: true });
  }

  deleteDescription(): void {
    this.DELETE({ description: true });
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

  setAuth(auth: RQAPI.Auth): void {
    this.SET({ data: { auth } });
  }

  setScripts(scripts: { preRequest?: string; postResponse?: string }): void {
    this.SET({ data: { scripts } });
  }

  setPreRequestScript(script: string): void {
    this.SET({ data: { scripts: { preRequest: script } } });
  }

  setPostResponseScript(script: string): void {
    this.SET({ data: { scripts: { postResponse: script } } });
  }

  deleteOperation(): void {
    this.DELETE({ data: { request: { operation: true } } });
  }

  deleteVariables(): void {
    this.DELETE({ data: { request: { variables: true } } });
  }

  deleteAuth(): void {
    this.DELETE({ data: { auth: true } });
  }
}

export class GraphQLRequestBufferUpdater extends GraphQLRequestUpdater {
  protected dispatchCommand(command: UpdateCommand<RQAPI.GraphQLApiRecord>): void {
    const apiClientCommand: UpdateCommand<RQAPI.ApiClientRecord> = command;
    this.dispatch(buffersActions.applyPatch({ id: this.meta.id, command: apiClientCommand }));
  }
}
