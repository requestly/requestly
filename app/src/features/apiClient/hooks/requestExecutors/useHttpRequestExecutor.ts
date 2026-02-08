import { HttpRequestExecutor } from "../../helpers/httpRequestExecutor/httpRequestExecutor";
import { useRequestExecutorFactory } from "./useRequestExecutorFactory";

export const useHttpRequestExecutor = (recordId: string) => {
  return useRequestExecutorFactory<HttpRequestExecutor>(HttpRequestExecutor, recordId);
};
