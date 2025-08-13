import { useGraphQLRecordStore } from "./useGraphQLRecordStore";
import { fetchGraphQLIntrospectionData } from "../helpers/introspectionQuery";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";

export const useGraphQLIntrospection = () => {
  const [
    url,
    setIntrospectionData,
    setIsFetchingIntrospectionData,
    setHasIntrospectionFailed,
  ] = useGraphQLRecordStore((state) => [
    state.entry.request.url,
    state.setIntrospectionData,
    state.setIsFetchingIntrospectionData,
    state.setHasIntrospectionFailed,
  ]);
  const appMode = useSelector(getAppMode);

  const introspectAndSaveSchema = async () => {
    setIsFetchingIntrospectionData(true);
    try {
      const introspectionData = await fetchGraphQLIntrospectionData(url, appMode);
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
