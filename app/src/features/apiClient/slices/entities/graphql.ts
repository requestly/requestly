import { KeyValuePair, RQAPI } from "features/apiClient/types";
import { InvalidEntityShape, UpdateCommand } from "../types";
import { apiRecordsActions } from "../apiRecords/slice";
import { selectRecordById } from "../apiRecords/selectors";
import { ApiClientStoreState } from "../workspaceView/helpers/ApiClientContextRegistry/types";
import { ApiClientRecordEntity } from "./api-client-record-entity";
import { ApiClientEntityType } from "./types";
import { ApiClientEntityMeta } from "./base";

export class GraphQLRecordEntity<M extends ApiClientEntityMeta = ApiClientEntityMeta> extends ApiClientRecordEntity<RQAPI.GraphQLApiRecord, M> {
  readonly type = ApiClientEntityType.GRAPHQL_RECORD;

  dispatchCommand(command: UpdateCommand<RQAPI.GraphQLApiRecord>): void {
    this.dispatch(apiRecordsActions.applyPatch({ id: this.meta.id, command }));
  }

  getEntityFromState(state: ApiClientStoreState): RQAPI.GraphQLApiRecord {
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
    return record as RQAPI.GraphQLApiRecord;
  }

  private getRequest(state: ApiClientStoreState): RQAPI.GraphQLRequest | undefined {
    return this.getEntityFromState(state)?.data?.request;
  }

  getResponse(state: ApiClientStoreState): RQAPI.GraphQLResponse | undefined {
    return this.getEntityFromState(state)?.data?.response;
  }

  getUrl(state: ApiClientStoreState): string | undefined {
    return this.getRequest(state)?.url;
  }

  getHeaders(state: ApiClientStoreState): KeyValuePair[] | undefined {
    return this.getRequest(state)?.headers;
  }

  getOperation(state: ApiClientStoreState): string | undefined {
    return this.getRequest(state)?.operation;
  }

  getVariables(state: ApiClientStoreState): string | undefined {
    return this.getRequest(state)?.variables;
  }

  getOperationName(state: ApiClientStoreState): string | undefined {
    return this.getRequest(state)?.operationName;
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
