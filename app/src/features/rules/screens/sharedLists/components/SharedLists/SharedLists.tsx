import { useState } from "react";
import { useSelector } from "react-redux";
import { useFetchSharedLists } from "./hooks/useFetchSharedLists";
import { SharedListsContentHeader } from "./components/SharedListsContentHeader/SharedListsContentHeader";
import { SharedListsTable } from "./components/SharedListsTable/SharedListsTable";
import CreateSharedListCTA from "./components/CreateSharedListCTA";
import SpinnerCard from "components/misc/SpinnerCard";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { getIsExtensionEnabled } from "store/selectors";
import ExtensionDeactivationMessage from "components/misc/ExtensionDeactivationMessage";
import TeamFeatureComingSoon from "components/landing/TeamFeatureComingSoon";
import "./sharedLists.scss";

export const SharedLists = () => {
  const isExtensionEnabled = useSelector(getIsExtensionEnabled);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  const [searchValue, setSearchValue] = useState("");
  const { sharedLists, isSharedListsLoading } = useFetchSharedLists();

  if (!isExtensionEnabled) {
    return <ExtensionDeactivationMessage />;
  }

  if (isSharedListsLoading) {
    return <SpinnerCard customLoadingMessage="Loading Shared Lists" />;
  }

  if (isWorkspaceMode) return <TeamFeatureComingSoon title="Shared lists" />;

  if (sharedLists?.length) {
    return (
      <div>
        <SharedListsContentHeader
          searchValue={searchValue}
          handleSearchValueUpdate={(value: string) => setSearchValue(value)}
        />
        <SharedListsTable sharedLists={sharedLists} searchValue={searchValue} />
      </div>
    );
  } else return <CreateSharedListCTA />;
};
