import React, { useEffect } from "react";
import { WorkspaceCreationErrorView } from "./WorkspaceCreationErrorView/WorkspaceCreationErrorView";
import { RQButton } from "lib/design-system-v2/components";
import { useOpenLocalWorkspace } from "features/workspaces/hooks/useOpenLocalWorkspace";
import { trackLocalWorkspaceCreationConflictShown } from "modules/analytics/events/common/teams";
import { displayFolderSelector } from "components/mode-specific/desktop/misc/FileDialogButton";
import { useWorkspaceCreationContext } from "componentsV2/modals/CreateWorkspaceModal/context";
import { checkIsWorkspacePathAvailable } from "services/fsManagerServiceAdapter";

interface Props {
  path: string;
  analyticEventSource: string;
  onValidFolderSelection: () => void;
  onOpenWorkspaceSuccess?: () => void;
}

export const ExistingWorkspaceConflictView: React.FC<Props> = ({
  path,
  analyticEventSource,
  onValidFolderSelection,
  onOpenWorkspaceSuccess,
}) => {
  const { setFolderPath } = useWorkspaceCreationContext();
  const { openWorkspace, isLoading: isOpeningWorkspaceLoading } = useOpenLocalWorkspace({
    analyticEventSource,
    onOpenWorkspaceCallback: () => {
      onOpenWorkspaceSuccess?.();
    },
  });

  const handleChooseAnotherFolder = () => {
    displayFolderSelector(async (selectedFolderPath: string) => {
      setFolderPath(selectedFolderPath);
      const isChosenFolderEligible = await checkIsWorkspacePathAvailable(selectedFolderPath);
      if (!isChosenFolderEligible) {
        return;
      }
      onValidFolderSelection();
    });
  };

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
            <RQButton onClick={handleChooseAnotherFolder}>Choose another folder</RQButton>
            <RQButton type="primary" onClick={() => openWorkspace(path)} loading={isOpeningWorkspaceLoading}>
              Use existing workspace
            </RQButton>
          </>
        }
      />
    </>
  );
};
