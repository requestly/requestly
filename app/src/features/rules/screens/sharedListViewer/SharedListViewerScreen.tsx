import { useMemo, useState } from "react";
import { SharedListsContentHeader } from "./components/SharedListViewerContentHeader/SharedListViewerContentHeader";
import { useFetchSharedListData } from "./hooks/useFetchSharedListData";
import { getFilterSharedListRecords, getSharedListIdFromURL } from "./utils";
import { SharedListViewerList } from "./components/SharedListViewerList/SharedListViewerList";

export const SharedListViewerScreen = () => {
  const sharedListId = getSharedListIdFromURL(window.location.pathname);
  const {
    isLoading,
    sharedListGroupsMap,
    sharedListGroupwiseRulesMap,
    sharedListGroups,
    sharedListRules,
  } = useFetchSharedListData({
    sharedListId,
  });
  const [searchValue, setSearchValue] = useState("");

  const filteredRecords = useMemo(() => {
    return getFilterSharedListRecords(sharedListGroupwiseRulesMap, sharedListGroupsMap, searchValue);
  }, [searchValue, sharedListGroupwiseRulesMap, sharedListGroupsMap]);

  return (
    <>
      <SharedListsContentHeader
        searchValue={searchValue}
        handleSearchValueUpdate={(value: string) => setSearchValue(value)}
        sharedListGroups={sharedListGroups}
        sharedListRules={sharedListRules}
        sharedListId={sharedListId}
      />
      <SharedListViewerList records={filteredRecords} isLoading={isLoading} />
    </>
  );
};
