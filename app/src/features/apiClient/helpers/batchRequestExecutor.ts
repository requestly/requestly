import { isGraphQLApiEntry, isHTTPApiEntry } from "../screens/apiClient/utils";
import { RQAPI } from "../types";
import { GraphQLRequestExecutor } from "./graphQLRequestExecutor/GraphQLRequestExecutor";
import { HttpRequestExecutor } from "./httpRequestExecutor/httpRequestExecutor";
import { Scope } from "./variableResolver/variable-resolver";
export class BatchRequestExecutor {
  constructor(
    private httpRequestExecutor: HttpRequestExecutor,
    private graphQLRequestExecutor: GraphQLRequestExecutor
  ) {}

  async executeSingleRequest(
    recordId: string,
    entry: RQAPI.ApiEntry,
    abortController?: AbortController,
    scopes?: Scope[]
  ): Promise<RQAPI.ExecutionResult> {
    if (isGraphQLApiEntry(entry)) {
      return this.graphQLRequestExecutor.executeGraphQLRequest(recordId, entry, abortController, scopes);
    } else if (isHTTPApiEntry(entry)) {
      return this.httpRequestExecutor.execute(recordId, entry, abortController, scopes);
    }

    throw new Error("Unsupported API entry type");
  }
}
