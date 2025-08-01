import { useState } from "react";
import { useGraphQLRecordStore } from "./useGraphQLRecordStore";
import { fetchGraphQLIntrospectionData } from "../helpers/introspectionQuery";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";

export const useGraphQLIntrospection = () => {
  const [url, setIntrospectionData] = useGraphQLRecordStore((state) => [
    state.record.data.request.url,
    state.setIntrospectionData,
    state.introspectionData,
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
      // Here you would typically save the introspection data to your store or state
      console.log("!!! Introspection Data:", introspectionData);
    } catch (error) {
      console.log("!!! Error fetching introspection data:", error);
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
