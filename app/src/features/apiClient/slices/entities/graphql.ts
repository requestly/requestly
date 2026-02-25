import { KeyValuePair, RQAPI } from "features/apiClient/types";
import { InvalidEntityShape, UpdateCommand } from "../types";
import { apiRecordsActions } from "../apiRecords/slice";
import { selectRecordById } from "../apiRecords/selectors";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { ApiClientRecordEntity } from "./api-client-record-entity";
import { ApiClientEntityType } from "./types";
import { ApiClientEntityMeta } from "./base";

export class GraphQLRecordEntity<
  M extends ApiClientEntityMeta = ApiClientEntityMeta,
  R extends RQAPI.GraphQLApiRecord | RQAPI.GraphQLExampleApiRecord = RQAPI.GraphQLApiRecord
> extends ApiClientRecordEntity<R, M> {
  readonly type = ApiClientEntityType.GRAPHQL_RECORD;

  dispatchCommand(command: UpdateCommand<R>): void {
    this.dispatch(apiRecordsActions.applyPatch({ id: this.meta.id, command }));
  }

  getEntityFromState(state: ApiClientStoreState): R {
    const record = selectRecordById(state, this.meta.id);
    if (record?.type !== RQAPI.RecordType.API) {
      throw new InvalidEntityShape({
        id: this.id,
        expectedType: RQAPI.RecordType.API,
        foundType: record?.type,
      });
    }
    if (record.data?.type !== RQAPI.ApiEntryType.GRAPHQL) {
      throw new InvalidEntityShape({
        id: this.id,
        expectedType: RQAPI.ApiEntryType.GRAPHQL,
        foundType: record.data.type,
      });
    }
    return record as R;
  }

  private getRequest(state: ApiClientStoreState): RQAPI.GraphQLRequest {
    return this.getEntityFromState(state).data.request;
  }

  getResponse(state: ApiClientStoreState): RQAPI.GraphQLResponse | undefined {
    return this.getEntityFromState(state)?.data?.response;
  }

  getUrl(state: ApiClientStoreState): string {
    return this.getRequest(state).url;
  }

  getHeaders(state: ApiClientStoreState): KeyValuePair[] {
    return this.getRequest(state).headers;
  }

  getOperation(state: ApiClientStoreState): string | undefined {
    return this.getRequest(state)?.operation;
  }

  getVariables(state: ApiClientStoreState): string | undefined {
    return this.getRequest(state)?.variables;
  }

  getOperationName(state: ApiClientStoreState): string | undefined {
    return this.getRequest(state).operationName;
  }

  setUrl(url: string): void {
    this.SETCOMMON({ data: { request: { url } } });
  }

  setHeaders(headers: KeyValuePair[]): void {
    this.SETCOMMON({ data: { request: { headers } } });
  }

  setOperation(operation: string): void {
    this.SETCOMMON({ data: { request: { operation } } });
  }

  setVariables(variables: string): void {
    this.SETCOMMON({ data: { request: { variables } } });
  }

  setOperationName(operationName: string): void {
    this.SETCOMMON({ data: { request: { operationName } } });
  }

  deleteOperation(): void {
    this.DELETECOMMON({ data: { request: { operation: null } } });
  }

  deleteVariables(): void {
    this.DELETECOMMON({ data: { request: { variables: null } } });
  }

  setResponse(response: RQAPI.GraphQLResponse): void {
    this.SETCOMMON({ data: { response } });
  }
}
