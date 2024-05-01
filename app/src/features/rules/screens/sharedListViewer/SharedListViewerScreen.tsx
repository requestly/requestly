import { useState } from "react";
import { SharedListsContentHeader } from "./components/SharedListViewerContentHeader/SharedListViewerContentHeader";
import { useFetchSharedListData } from "./hooks/useFetchSharedListData";
import { getSharedListIdFromURL } from "./utils";
import { SharedListViewerList } from "./components/SharedListViewerList/SharedListViewerList";

export const SharedListViewerScreen = () => {
  const sharedListId = getSharedListIdFromURL(window.location.pathname);
  const { isLoading, sharedListRecords } = useFetchSharedListData({ sharedListId });
  const [searchValue, setSearchValue] = useState("");

  console.log(isLoading, sharedListRecords);

  return (
    <>
      <SharedListsContentHeader
        searchValue={searchValue}
        handleSearchValueUpdate={(value: string) => setSearchValue(value)}
      />
      <SharedListViewerList records={sharedListRecords} isLoading={isLoading} />
    </>
  );
};
