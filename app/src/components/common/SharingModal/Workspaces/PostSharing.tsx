import React, { useCallback, useMemo } from "react";
import { RQButton } from "lib/design-system/components";
import WorkspaceAvatar from "features/workspaces/components/WorkspaceAvatar";
import { FaRegCopy } from "@react-icons/all-files/fa/FaRegCopy";
import { PostShareViewData, WorkspaceSharingTypes } from "../types";
import { trackInviteTeammatesClicked } from "modules/analytics/events/common/teams";
import "./index.scss";
import { useWorkspaceHelpers } from "features/workspaces/hooks/useWorkspaceHelpers";
import { toast } from "utils/Toast";

interface PostSharingProps {
  postShareViewData: PostShareViewData;
  setPostShareViewData: ({ type, targetTeamData }: PostShareViewData) => void;
  toggleModal: () => void;
}

export const PostSharing: React.FC<PostSharingProps> = ({ postShareViewData, setPostShareViewData, toggleModal }) => {
  const { switchWorkspace } = useWorkspaceHelpers();

  const handleSwitchWorkspace = useCallback(() => {
    switchWorkspace(postShareViewData.targetTeamData.id, "sharing_modal").then(() => {
      toggleModal();
      toast.error(
        "Failed to switch workspace. Please reload and try again. If the issue persists, please contact support."
      );
    });
  }, [switchWorkspace, postShareViewData.targetTeamData.id, toggleModal]);

  const postSharingViews = useMemo(() => {
    return {
      [WorkspaceSharingTypes.NEW_WORKSPACE_CREATED]: {
        header: <img src={"/assets/media/components/mail-success.svg"} alt="mail sent" width={60} />,
        message: "New Workspace created and Teammates invited!",
        ctaText: "Switch to the new workspace",
        action: handleSwitchWorkspace,
      },
      [WorkspaceSharingTypes.USERS_INVITED]: {
        header: <img src={"/assets/media/components/mail-success.svg"} alt="mail sent" width={60} />,
        message: "Email invites sent!",
        ctaText: "Invite more users",
        action: () => {
          setPostShareViewData(null);
          trackInviteTeammatesClicked("sharing_modal");
        }, // clear post share data and go back to workspace sharing screen,
      },
      [WorkspaceSharingTypes.EXISTING_WORKSPACE]: {
        header: <WorkspaceSharingInfoHeader postShareViewData={postShareViewData} />,
        message: `Selected rules have been copied to ${postShareViewData.targetTeamData?.name}`,
        ctaText: "Switch to the workspace",
        action: handleSwitchWorkspace,
      },
    };
  }, [handleSwitchWorkspace, setPostShareViewData, postShareViewData]);

  return (
    <div className="post-sharing-wrapper">
      {postSharingViews[postShareViewData.type].header}
      <div className="subheader">{postSharingViews[postShareViewData.type].message}</div>
      <RQButton
        type="primary"
        className="sharing-primary-btn"
        onClick={postSharingViews[postShareViewData.type].action}
      >
        {postSharingViews[postShareViewData.type].ctaText}
      </RQButton>
    </div>
  );
};

const WorkspaceSharingInfoHeader: React.FC<{ postShareViewData: PostShareViewData }> = ({ postShareViewData }) => {
  const { targetTeamData, sourceTeamData } = postShareViewData;

  return (
    <div className="items-center workspace-sharing-flow-cta">
      <div className="sharing-flow-cta-workspace-avatar">
        <WorkspaceAvatar workspace={sourceTeamData} />
        <div className="mt-8">{sourceTeamData?.name}</div>
      </div>
      <FaRegCopy className="header text-gray" />
      <div className="sharing-flow-cta-workspace-avatar">
        <WorkspaceAvatar workspace={targetTeamData} />
        <div className="mt-8">{targetTeamData?.name}</div>
      </div>
    </div>
  );
};
