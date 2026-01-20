import { GraphQLRequestExecutor } from "../../helpers/graphQLRequestExecutor/GraphQLRequestExecutor";
import { useRequestExecutorFactory } from "./useRequestExecutorFactory";

export const useGraphQLRequestExecutor = (collectionId: string) => {
  return useRequestExecutorFactory<GraphQLRequestExecutor>(GraphQLRequestExecutor, collectionId);
};
