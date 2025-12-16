import { KeyValuePair, RQAPI } from "features/apiClient/types";
import { InvalidEntityShape, UpdateCommand } from "../types";
import { apiRecordsActions } from "../apiRecords/slice";
import { selectRecordById } from "../apiRecords/selectors";
import { ApiClientRootState } from "../hooks/types";
import { ApiClientRecordEntity } from "./api-client-record-entity";
import { ApiClientEntityType } from "./types";

export class GraphQLRecordEntity extends ApiClientRecordEntity<RQAPI.GraphQLApiRecord> {
  readonly type = ApiClientEntityType.GRAPHQL_RECORD;

  dispatchCommand(command: UpdateCommand<RQAPI.GraphQLApiRecord>): void {
    this.dispatch(apiRecordsActions.applyPatch({ id: this.meta.id, command }));
  }

  getEntityFromState(state: ApiClientRootState): RQAPI.GraphQLApiRecord {
    const record = selectRecordById(state, this.meta.id);
    if (record?.type !== RQAPI.RecordType.API) {
      throw new InvalidEntityShape({
        id: this.id,
        expectedType: RQAPI.RecordType.API,
        foundType: record?.type,
      });

    };
    if (record.data?.type !== RQAPI.ApiEntryType.GRAPHQL) {
      throw new InvalidEntityShape({
        id: this.id,
        expectedType: RQAPI.ApiEntryType.GRAPHQL,
        foundType: record.data.type,
      });


    };
    return record as RQAPI.GraphQLApiRecord;
  }

  private getRequest(state: ApiClientRootState): RQAPI.GraphQLRequest | undefined {
    return this.getEntityFromState(state)?.data?.request;
  }

  getResponse(state: ApiClientRootState): RQAPI.GraphQLResponse | undefined {
    return this.getEntityFromState(state)?.data?.response;
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
}
