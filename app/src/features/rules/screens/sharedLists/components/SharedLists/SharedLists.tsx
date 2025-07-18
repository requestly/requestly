import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useFetchSharedLists } from "./hooks/useFetchSharedLists";
import { SharedListsContentHeader } from "./components/SharedListsContentHeader/SharedListsContentHeader";
import { SharedListsTable } from "./components/SharedListsTable/SharedListsTable";
import CreateSharedListCTA from "./components/CreateSharedListCTA";
import SpinnerCard from "components/misc/SpinnerCard";
import { getIsExtensionEnabled } from "store/selectors";
import ExtensionDeactivationMessage from "components/misc/ExtensionDeactivationMessage";
import { SharedList } from "./types";
import "./sharedLists.scss";

export const SharedLists = () => {
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);
  const [searchValue, setSearchValue] = useState("");
  const { sharedLists, isSharedListsLoading, triggerForceRender } = useFetchSharedLists();

  const filteredSharedLists = useMemo(() => {
    if (!sharedLists) return [];
    else {
      return sharedLists?.filter((list: SharedList) =>
        list.listName?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
  }, [sharedLists, searchValue]);

  if (!isExtensionEnabled) {
    return <ExtensionDeactivationMessage />;
  }

  if (isSharedListsLoading) {
    return <SpinnerCard customLoadingMessage="Loading Shared Lists" />;
  }

  if (sharedLists?.length) {
    return (
      <div>
        <SharedListsContentHeader
          searchValue={searchValue}
          handleSearchValueUpdate={(value: string) => setSearchValue(value)}
        />
        <SharedListsTable sharedLists={filteredSharedLists} forceRender={triggerForceRender} />
      </div>
    );
  } else return <CreateSharedListCTA />;
};
