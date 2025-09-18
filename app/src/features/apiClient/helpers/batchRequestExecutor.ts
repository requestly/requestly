import { isGraphQLApiEntry, isHTTPApiEntry } from "../screens/apiClient/utils";
import { RQAPI } from "../types";
import { GraphQLRequestExecutor } from "./graphQLRequestExecutor/GraphQLRequestExecutor";
import { HttpRequestExecutor } from "./httpRequestExecutor/httpRequestExecutor";
export class BatchRequestExecutor {
  constructor(
    private httpRequestExecutor: HttpRequestExecutor,
    private graphQLRequestExecutor: GraphQLRequestExecutor
  ) {}

  // async *executeBatches(
  //   batchedEntryDetails: {
  //     recordId: string;
  //     entry: RQAPI.ApiEntry;
  //   }[],
  //   runConfig: RQAPI.RunConfig
  // ) {
  //   const { runOrder, iterations, delay } = runConfig;

  //   const entryMap = new Map(batchedEntryDetails.map((e) => [e.recordId, e.entry]));

  //   for (let iterationIndex = 0; iterationIndex < iterations; ++iterationIndex) {
  //     for (let executionIndex = 0; executionIndex < runOrder.length; ++executionIndex) {
  //       const recordId = runOrder[executionIndex];
  //       const entry = entryMap.get(recordId);
  //       if (entry) {
  //         yield await this.executeSingleRequest(recordId, entry);

  //         // Only delay if there's a next request
  //         const isLastRequestInIteration = executionIndex === runOrder.length - 1;
  //         const isLastIteration = iterationIndex === iterations - 1;
  //         const hasNextRequest = !isLastRequestInIteration || !isLastIteration;

  //         if (delay > 0 && hasNextRequest) {
  //           await this.delay(delay);
  //         }
  //       }
  //     }
  //   }
  // }

  async executeSingleRequest(recordId: string, entry: RQAPI.ApiEntry): Promise<RQAPI.ExecutionResult> {
    if (isGraphQLApiEntry(entry)) {
      return this.graphQLRequestExecutor.executeGraphQLRequest(recordId, entry);
    } else if (isHTTPApiEntry(entry)) {
      return this.httpRequestExecutor.execute(recordId, entry);
    }

    throw new Error("Unsupported API entry type");
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
