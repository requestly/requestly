import { useState } from "react";
import { useGraphQLRecordStore } from "./useGraphQLRecordStore";
import { fetchGraphQLIntrospectionData } from "../helpers/introspectionQuery";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";

export const useGraphQLIntrospection = () => {
  const [url, setIntrospectionData] = useGraphQLRecordStore((state) => [
    state.record.data.request.url,
    state.setIntrospectionData,
  ]);
  const appMode = useSelector(getAppMode);

  const [fetchingIntrospectionData, setFetchingIntrospectionData] = useState(false);
  const [isIntrospectionDataFetchingFailed, setIsIntrospectionDataFetchingFailed] = useState(false);

  const introspectAndSaveSchema = async () => {
    setFetchingIntrospectionData(true);
    setIsIntrospectionDataFetchingFailed(false);
    try {
      const introspectionData = await fetchGraphQLIntrospectionData(url, appMode);
      if (!introspectionData) {
        throw new Error("No introspection data received");
      }
      setIntrospectionData(introspectionData);
    } catch (error) {
      setIntrospectionData(null);
      setIsIntrospectionDataFetchingFailed(true);
    } finally {
      setFetchingIntrospectionData(false);
    }
  };

  return {
    introspectAndSaveSchema,
    fetchingIntrospectionData,
    isIntrospectionDataFetchingFailed,
  };
};
