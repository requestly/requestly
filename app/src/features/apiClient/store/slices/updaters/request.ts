import { Dispatch } from "@reduxjs/toolkit";
import { KeyValuePair, RequestContentType, RequestMethod, RQAPI } from "features/apiClient/types";
import { DeepPartialWithNull, DeleteMarker, UpdateCommand } from "../types";
import { apiRecordsActions } from "../apiRecords/slice";
import { buffersActions } from "../buffers/slice";
import { BaseUpdater, UpdaterMeta } from "./base";

export abstract class RequestUpdater<T extends RQAPI.ApiRecord> extends BaseUpdater<T> {
  constructor(dispatch: Dispatch, meta: UpdaterMeta) {
    super(dispatch, meta);
  }

  setName(name: string): void {
    this.dispatchCommand({ type: "SET", value: { name } as DeepPartialWithNull<T> });
  }

  setDescription(description: string): void {
    this.dispatchCommand({ type: "SET", value: { description } as DeepPartialWithNull<T> });
  }

  setCollectionId(collectionId: string | null): void {
    this.dispatchCommand({ type: "SET", value: { collectionId } as DeepPartialWithNull<T> });
  }

  deleteName(): void {
    this.dispatchCommand({ type: "DELETE", value: { name: true } as DeleteMarker<T> });
  }

  deleteDescription(): void {
    this.dispatchCommand({ type: "DELETE", value: { description: true } as DeleteMarker<T> });
  }
}

export class HttpRequestUpdater extends RequestUpdater<RQAPI.HttpApiRecord> {
  constructor(dispatch: Dispatch, meta: UpdaterMeta) {
    super(dispatch, meta);
  }

  protected dispatchCommand(command: UpdateCommand<RQAPI.HttpApiRecord>): void {
    this.dispatch(
      apiRecordsActions.executeCommand({
        id: this.meta.id,
        command: command as UpdateCommand<RQAPI.ApiClientRecord>,
      })
    );
  }

  setUrl(url: string): void {
    this.dispatchCommand({ type: "SET", value: { data: { request: { url } } } });
  }

  setMethod(method: RequestMethod): void {
    this.dispatchCommand({ type: "SET", value: { data: { request: { method } } } });
  }

  setHeaders(headers: KeyValuePair[]): void {
    this.dispatchCommand({ type: "SET", value: { data: { request: { headers } } } });
  }

  setQueryParams(queryParams: KeyValuePair[]): void {
    this.dispatchCommand({ type: "SET", value: { data: { request: { queryParams } } } });
  }

  setBody(body: RQAPI.RequestBody): void {
    this.dispatchCommand({ type: "SET", value: { data: { request: { body } } } });
  }

  setContentType(contentType: RequestContentType): void {
    this.dispatchCommand({ type: "SET", value: { data: { request: { contentType } } } });
  }

  setAuth(auth: RQAPI.Auth): void {
    this.dispatchCommand({ type: "SET", value: { data: { auth } } });
  }

  setScripts(scripts: { preRequest?: string; postResponse?: string }): void {
    this.dispatchCommand({ type: "SET", value: { data: { scripts } } });
  }

  setPreRequestScript(script: string): void {
    this.dispatchCommand({ type: "SET", value: { data: { scripts: { preRequest: script } } } });
  }

  setPostResponseScript(script: string): void {
    this.dispatchCommand({ type: "SET", value: { data: { scripts: { postResponse: script } } } });
  }

  deleteUrl(): void {
    this.dispatchCommand({ type: "DELETE", value: { data: { request: { url: true } } } });
  }

  deleteBody(): void {
    this.dispatchCommand({ type: "DELETE", value: { data: { request: { body: true } } } });
  }

  deleteAuth(): void {
    this.dispatchCommand({ type: "DELETE", value: { data: { auth: true } } });
  }
}

export class HttpRequestBufferUpdater extends HttpRequestUpdater {
  protected dispatchCommand(command: UpdateCommand<RQAPI.HttpApiRecord>): void {
    this.dispatch(
      buffersActions.executeBufferCommand({
        id: this.meta.id,
        command: command as UpdateCommand,
      })
    );
  }
}

export class GraphQLRequestUpdater extends RequestUpdater<RQAPI.GraphQLApiRecord> {
  constructor(dispatch: Dispatch, meta: UpdaterMeta) {
    super(dispatch, meta);
  }

  protected dispatchCommand(command: UpdateCommand<RQAPI.GraphQLApiRecord>): void {
    this.dispatch(
      apiRecordsActions.executeCommand({
        id: this.meta.id,
        command: command as UpdateCommand<RQAPI.ApiClientRecord>,
      })
    );
  }

  setUrl(url: string): void {
    this.dispatchCommand({ type: "SET", value: { data: { request: { url } } } });
  }

  setHeaders(headers: KeyValuePair[]): void {
    this.dispatchCommand({ type: "SET", value: { data: { request: { headers } } } });
  }

  setOperation(operation: string): void {
    this.dispatchCommand({ type: "SET", value: { data: { request: { operation } } } });
  }

  setVariables(variables: string): void {
    this.dispatchCommand({ type: "SET", value: { data: { request: { variables } } } });
  }

  setOperationName(operationName: string): void {
    this.dispatchCommand({ type: "SET", value: { data: { request: { operationName } } } });
  }

  setAuth(auth: RQAPI.Auth): void {
    this.dispatchCommand({ type: "SET", value: { data: { auth } } });
  }

  setScripts(scripts: { preRequest?: string; postResponse?: string }): void {
    this.dispatchCommand({ type: "SET", value: { data: { scripts } } });
  }

  setPreRequestScript(script: string): void {
    this.dispatchCommand({ type: "SET", value: { data: { scripts: { preRequest: script } } } });
  }

  setPostResponseScript(script: string): void {
    this.dispatchCommand({ type: "SET", value: { data: { scripts: { postResponse: script } } } });
  }

  deleteOperation(): void {
    this.dispatchCommand({ type: "DELETE", value: { data: { request: { operation: true } } } });
  }

  deleteVariables(): void {
    this.dispatchCommand({ type: "DELETE", value: { data: { request: { variables: true } } } });
  }

  deleteAuth(): void {
    this.dispatchCommand({ type: "DELETE", value: { data: { auth: true } } });
  }
}

export class GraphQLRequestBufferUpdater extends GraphQLRequestUpdater {
  protected dispatchCommand(command: UpdateCommand<RQAPI.GraphQLApiRecord>): void {
    this.dispatch(
      buffersActions.executeBufferCommand({
        id: this.meta.id,
        command: command as UpdateCommand,
      })
    );
  }
}
