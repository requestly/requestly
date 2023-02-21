import React from "react";

import MockListIndex from "components/features/mocksV2/MockList";
import { MockListProvider } from "components/features/mocksV2/MockListContext";
import { MockType } from "components/features/mocksV2/types";
import { useSelector } from "react-redux";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import TeamFeatureComingSoon from "components/landing/TeamFeatureComingSoon";

const FileMockListView = () => {
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  if (isWorkspaceMode) return <TeamFeatureComingSoon title="File server" />;

  return (
    <MockListProvider
      value={{
        type: MockType.FILE,
      }}
    >
      <MockListIndex />
    </MockListProvider>
  );
};

export default FileMockListView;
