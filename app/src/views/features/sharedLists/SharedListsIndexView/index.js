import TeamFeatureComingSoon from "components/landing/TeamFeatureComingSoon";
import FEATURES from "config/constants/sub/features";
import React from "react";
import { useSelector } from "react-redux";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import featureFlag from "utils/feature-flag";

import SharedListsIndexPage from "../../../../components/features/sharedLists/SharedListsIndexPage";

export default function SharedListsIndexView() {
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);
  if (
    isWorkspaceMode &&
    !featureFlag.getValue(FEATURES.WORKSPACE_SHARED_LISTS, false)
  )
    return <TeamFeatureComingSoon title="Shared lists" />;

  return <SharedListsIndexPage />;
}
