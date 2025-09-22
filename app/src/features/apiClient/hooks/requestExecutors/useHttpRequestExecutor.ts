import { HttpRequestExecutor } from "../../helpers/httpRequestExecutor/httpRequestExecutor";
import { useRequestExecutorFactory } from "./useRequestExecutorFactory";

export const useHttpRequestExecutor = (collectionId: string) => {
  return useRequestExecutorFactory(HttpRequestExecutor, collectionId);
};
