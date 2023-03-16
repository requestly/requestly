import React from "react";
import MockListIndex from "components/features/mocksV2/MockList";
import { MockType } from "components/features/mocksV2/types";
import FEATURES from "config/constants/sub/features";
import { useSelector } from "react-redux";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import TeamFeatureComingSoon from "components/landing/TeamFeatureComingSoon";
import featureFlag from "utils/feature-flag";

const MockListView = () => {
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  if (isWorkspaceMode && !featureFlag.getValue(FEATURES.WORKSPACE_MOCKS, false))
    return <TeamFeatureComingSoon title="Mock server" />;

  return <MockListIndex type={MockType.API} />;
};

export default MockListView;
