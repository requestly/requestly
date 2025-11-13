import { isGraphQLApiEntry, isHTTPApiEntry } from "../screens/apiClient/utils";
import { RQAPI } from "../types";
import { GraphQLRequestExecutor } from "./graphQLRequestExecutor/GraphQLRequestExecutor";
import { HttpRequestExecutor } from "./httpRequestExecutor/httpRequestExecutor";
import { IterationContext } from "./modules/scriptsV2/worker/script-internals/types";
import { Scope } from "./variableResolver/variable-resolver";
export class BatchRequestExecutor {
  constructor(
    private httpRequestExecutor: HttpRequestExecutor,
    private graphQLRequestExecutor: GraphQLRequestExecutor
  ) {}

  async executeSingleRequest(
    entryDetails: {
      entry: RQAPI.ApiEntry;
      recordId: string;
    },
    iterationContext: IterationContext,
    executionConfig?: {
      abortController?: AbortController;
      scopes?: Scope[];
    }
  ): Promise<RQAPI.ExecutionResult> {
    const { entry, recordId } = entryDetails;
    const { abortController, scopes } = executionConfig || {};

    if (isGraphQLApiEntry(entry)) {
      return this.graphQLRequestExecutor.executeGraphQLRequest({ entry, recordId }, iterationContext, {
        abortController,
        scopes,
      });
    } else if (isHTTPApiEntry(entry)) {
      return this.httpRequestExecutor.execute({ entry, recordId }, iterationContext, { abortController, scopes });
    }

    throw new Error("Unsupported API entry type");
  }
}
