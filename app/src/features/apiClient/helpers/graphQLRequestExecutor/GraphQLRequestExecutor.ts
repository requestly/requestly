import { HttpRequestExecutor } from "../httpRequestExecutor/httpRequestExecutor";
import { RQAPI } from "../../types";
import {
  graphQLEntryToHttpEntryAdapter,
  httpEntryToGraphQLEntryAdapter,
} from "../../screens/apiClient/components/views/graphql/utils";

export class GraphQLRequestExecutor extends HttpRequestExecutor {
  /**
   * Executes a GraphQL request by converting it to HTTP format and using the parent's execute method
   * @param record - The GraphQL API record to execute
   * @returns Promise<RQAPI.ExecutionResult>
   */
  async executeGraphQLRequest(record: RQAPI.GraphQLApiRecord): Promise<RQAPI.ExecutionResult> {
    this.prepareGraphQLRequest(record);
    const apiClientExecutionResult = await this.execute();
    const graphQLEntryWithResponse: RQAPI.GraphQLApiEntry = httpEntryToGraphQLEntryAdapter(
      apiClientExecutionResult.executedEntry as RQAPI.HttpApiEntry
    );

    return {
      ...apiClientExecutionResult,
      executedEntry: graphQLEntryWithResponse,
    };
  }

  prepareGraphQLRequest(record: RQAPI.GraphQLApiRecord) {
    const graphQLRequestEntry = record.data as RQAPI.GraphQLApiEntry;
    const httpRequestEntry = graphQLEntryToHttpEntryAdapter(graphQLRequestEntry);

    this.updateEntryDetails({
      entry: httpRequestEntry,
      recordId: record.id,
      collectionId: record.collectionId,
    });

    return super.prepareRequest();
  }
}
