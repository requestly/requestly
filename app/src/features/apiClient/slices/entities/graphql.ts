import { KeyValuePair, RQAPI } from "features/apiClient/types";
import { UpdateCommand } from "../types";
import { apiRecordsActions } from "../apiRecords/slice";
import { selectRecordById } from "../apiRecords/selectors";
import { ApiClientRootState } from "../hooks/types";
import { RequestEntity } from "./request";
import { EntityType, SerializedEntity } from "./types";

export class GraphQLRecordEntity extends RequestEntity<RQAPI.GraphQLApiRecord> {
  readonly type = EntityType.GRAPHQL_RECORD;

  protected dispatchCommand(command: UpdateCommand<RQAPI.GraphQLApiRecord>): void {
    this.dispatch(apiRecordsActions.applyPatch({ id: this.meta.id, command }));
  }

  getFromState(state: ApiClientRootState): RQAPI.GraphQLApiRecord | undefined {
    const record = selectRecordById(state, this.meta.id);
    if (record?.type !== RQAPI.RecordType.API) return undefined;
    if (record.data?.type !== RQAPI.ApiEntryType.GRAPHQL) return undefined;
    return record as RQAPI.GraphQLApiRecord;
  }

  private getRequest(state: ApiClientRootState): RQAPI.GraphQLRequest | undefined {
    return this.getFromState(state)?.data?.request;
  }

  getResponse(state: ApiClientRootState): RQAPI.GraphQLResponse | undefined {
    return this.getFromState(state)?.data?.response;
  }

  getUrl(state: ApiClientRootState): string | undefined {
    return this.getRequest(state)?.url;
  }

  getHeaders(state: ApiClientRootState): KeyValuePair[] | undefined {
    return this.getRequest(state)?.headers;
  }

  getOperation(state: ApiClientRootState): string | undefined {
    return this.getRequest(state)?.operation;
  }

  getVariables(state: ApiClientRootState): string | undefined {
    return this.getRequest(state)?.variables;
  }

  getOperationName(state: ApiClientRootState): string | undefined {
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

  serialize(): SerializedEntity<EntityType.GRAPHQL_RECORD> {
    return { id: this.meta.id, type: this.type };
  }
}
