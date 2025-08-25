import { useGraphQLRecordStore } from "./useGraphQLRecordStore";
import { fetchGraphQLIntrospectionData } from "../helpers/introspectionQuery";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { renderVariables } from "backend/environment/utils";
import { useApiClientFeatureContext } from "../contexts/meta";

export const useGraphQLIntrospection = () => {
  const [
    recordId,
    url,
    setIntrospectionData,
    setIsFetchingIntrospectionData,
    setHasIntrospectionFailed,
  ] = useGraphQLRecordStore((state) => [
    state.recordId,
    state.entry.request.url,
    state.setIntrospectionData,
    state.setIsFetchingIntrospectionData,
    state.setHasIntrospectionFailed,
  ]);
  const appMode = useSelector(getAppMode);
  const ctx = useApiClientFeatureContext();

  const introspectAndSaveSchema = async () => {
    setIsFetchingIntrospectionData(true);
    try {
      const { result: renderedUrl } = renderVariables(url, recordId, ctx);
      const introspectionData = await fetchGraphQLIntrospectionData(renderedUrl, appMode);
      if (!introspectionData) {
        throw new Error("No introspection data received");
      }
      setIntrospectionData(introspectionData);
      setHasIntrospectionFailed(false);
    } catch (error) {
      setIntrospectionData(null);
      setHasIntrospectionFailed(true);
    } finally {
      setIsFetchingIntrospectionData(false);
    }
  };

  return {
    introspectAndSaveSchema,
  };
};
