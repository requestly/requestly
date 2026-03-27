import { GraphQLRequestExecutor } from "../../helpers/graphQLRequestExecutor/GraphQLRequestExecutor";
import { useRequestExecutorFactory } from "./useRequestExecutorFactory";

export const useGraphQLRequestExecutor = (recordId: string) => {
  return useRequestExecutorFactory<GraphQLRequestExecutor>(GraphQLRequestExecutor, recordId);
};
