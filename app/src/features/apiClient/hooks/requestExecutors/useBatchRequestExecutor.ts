import { BatchRequestExecutor } from "features/apiClient/helpers/batchRequestExecutor";
import { useGraphQLRequestExecutor } from "./useGraphQLRequestExecutor";
import { useHttpRequestExecutor } from "./useHttpRequestExecutor";
import { useMemo } from "react";

export const useBatchRequestExecutor = (collectionId: string) => {
  const httpRequestExecutor = useHttpRequestExecutor(collectionId);
  const graphQLRequestExecutor = useGraphQLRequestExecutor(collectionId);

  return useMemo(() => {
    return new BatchRequestExecutor(httpRequestExecutor, graphQLRequestExecutor);
  }, [httpRequestExecutor, graphQLRequestExecutor]);
};
