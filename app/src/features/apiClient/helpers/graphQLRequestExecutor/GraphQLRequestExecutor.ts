import { RQAPI } from "../../types";
import {
  graphQLEntryToHttpEntryAdapter,
  httpEntryToGraphQLEntryAdapter,
} from "../../screens/apiClient/components/views/graphql/utils";
import { HttpRequestExecutor } from "../httpRequestExecutor/httpRequestExecutor";
import { Scope } from "../variableResolver/variable-resolver";
import { IterationContext } from "../modules/scriptsV2/worker/script-internals/types";
import { ExecutionContext } from "../httpRequestExecutor/scriptExecutionContext";

export class GraphQLRequestExecutor extends HttpRequestExecutor {
  /**
   * Executes a GraphQL request by converting it to HTTP format and using the parent's execute method
   * @returns Promise<RQAPI.ExecutionResult>
   */
  async executeGraphQLRequest(
    entryDetails: {
      entry: RQAPI.GraphQLApiEntry;
      recordId: string;
    },
    iterationContext: IterationContext,
    executionConfig?: {
      abortController?: AbortController;
      scopes?: Scope[];
      executionContext?: ExecutionContext;
    }
  ): Promise<RQAPI.ExecutionResult> {
    const { entry, recordId } = entryDetails;
    const { abortController, scopes, executionContext } = executionConfig || {};

    const httpPreparedEntry = this.prepareGraphQLRequest(recordId, entry, scopes);
    const apiClientExecutionResult = await this.execute(
      { entry: httpPreparedEntry.preparedEntry, recordId },
      iterationContext,
      { abortController, scopes, executionContext }
    );
    const graphQLEntryWithResponse: RQAPI.GraphQLApiEntry = httpEntryToGraphQLEntryAdapter(
      apiClientExecutionResult.executedEntry as RQAPI.HttpApiEntry
    );

    return {
      ...apiClientExecutionResult,
      executedEntry: graphQLEntryWithResponse,
    };
  }

  prepareGraphQLRequest(recordId: string, entry: RQAPI.GraphQLApiEntry, scopes?: Scope[]) {
    const graphQLRequestEntry = entry;
    const httpRequestEntry = graphQLEntryToHttpEntryAdapter(graphQLRequestEntry);

    return this.requestPreparer.prepareRequest(recordId, httpRequestEntry, scopes);
  }
}
