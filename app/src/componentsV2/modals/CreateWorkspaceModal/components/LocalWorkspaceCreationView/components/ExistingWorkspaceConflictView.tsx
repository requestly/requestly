import React, { useEffect } from "react";
import { WorkspaceCreationErrorView } from "./WorkspaceCreationErrorView/WorkspaceCreationErrorView";
import { RQButton } from "lib/design-system-v2/components";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { useOpenLocalWorkspace } from "features/workspaces/hooks/useOpenLocalWorkspace";
import { trackLocalWorkspaceCreationConflictShown } from "modules/analytics/events/common/teams";

interface Props {
  path: string;
  analyticEventSource: string;
  onChooseAnotherFolder: () => void;
}

export const ExistingWorkspaceConflictView: React.FC<Props> = ({
  path,
  analyticEventSource,
  onChooseAnotherFolder,
}) => {
  const dispatch = useDispatch();
  const { openWorkspace, isLoading: isOpeningWorkspaceLoading } = useOpenLocalWorkspace({
    analyticEventSource,
    onOpenWorkspaceCallback: () => {
      dispatch(globalActions.updateIsOnboardingCompleted(true));
    },
  });

  useEffect(() => {
    trackLocalWorkspaceCreationConflictShown("config_exists_create_new_attempted", analyticEventSource);
  }, [analyticEventSource]);

  return (
    <>
      <WorkspaceCreationErrorView
        title="Workspace already exists in this folder"
        description="This folder already contains Requestly workspace files. You can continue using the existing workspace or choose a different folder."
        path={path}
        actions={
          <>
            <RQButton onClick={onChooseAnotherFolder}>Choose another folder</RQButton>
            <RQButton type="primary" onClick={() => openWorkspace(path)} loading={isOpeningWorkspaceLoading}>
              Use existing workspace
            </RQButton>
          </>
        }
      />
    </>
  );
};
