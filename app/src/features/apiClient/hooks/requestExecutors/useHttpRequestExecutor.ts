import { HttpRequestExecutor } from "../../helpers/httpRequestExecutor/httpRequestExecutor";
import { useRequestExecutorFactory } from "./useRequestExecutorFactory";

export const useHttpRequestExecutor = (collectionId?: string | null) => {
  return useRequestExecutorFactory<HttpRequestExecutor>(HttpRequestExecutor, collectionId);
};
