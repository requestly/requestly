import { RQAPI } from "features/apiClient/types";
import { HttpRequestExecutor } from "../../helpers/httpRequestExecutor/httpRequestExecutor";
import { useRequestExecutorFactory } from "./useRequestExecutorFactory";

export const useHttpRequestExecutor = (collectionId: RQAPI.CollectionRecord["collectionId"]) => {
  return useRequestExecutorFactory<HttpRequestExecutor>(HttpRequestExecutor, collectionId);
};
