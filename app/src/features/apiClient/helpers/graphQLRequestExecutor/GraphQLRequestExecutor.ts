import { RQAPI } from "../../types";
import {
  graphQLEntryToHttpEntryAdapter,
  httpEntryToGraphQLEntryAdapter,
} from "../../screens/apiClient/components/views/graphql/utils";
import { HttpRequestExecutor } from "../httpRequestExecutor/httpRequestExecutor";
import { Scope } from "../variableResolver/variable-resolver";

export class GraphQLRequestExecutor extends HttpRequestExecutor {
  /**
   * Executes a GraphQL request by converting it to HTTP format and using the parent's execute method
   * @returns Promise<RQAPI.ExecutionResult>
   */
  async executeGraphQLRequest(
    recordId: string,
    entry: RQAPI.GraphQLApiEntry,
    abortController?: AbortController,
    scopes?: Scope[]
  ): Promise<RQAPI.ExecutionResult> {
    const httpPreparedEntry = this.prepareGraphQLRequest(recordId, entry, scopes);
    const apiClientExecutionResult = await this.execute(
      recordId,
      httpPreparedEntry.preparedEntry,
      abortController,
      scopes
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
