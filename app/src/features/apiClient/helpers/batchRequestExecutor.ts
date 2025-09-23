import { isGraphQLApiEntry, isHTTPApiEntry } from "../screens/apiClient/utils";
import { RQAPI } from "../types";
import { GraphQLRequestExecutor } from "./graphQLRequestExecutor/GraphQLRequestExecutor";
import { HttpRequestExecutor } from "./httpRequestExecutor/httpRequestExecutor";
export class BatchRequestExecutor {
  constructor(
    private httpRequestExecutor: HttpRequestExecutor,
    private graphQLRequestExecutor: GraphQLRequestExecutor
  ) {}

  async executeSingleRequest(recordId: string, entry: RQAPI.ApiEntry): Promise<RQAPI.ExecutionResult> {
    if (isGraphQLApiEntry(entry)) {
      return this.graphQLRequestExecutor.executeGraphQLRequest(recordId, entry);
    } else if (isHTTPApiEntry(entry)) {
      return this.httpRequestExecutor.execute(recordId, entry);
    }

    throw new Error("Unsupported API entry type");
  }

  
}
