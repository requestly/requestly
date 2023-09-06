import React, { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { WorkspaceSharingTypes } from "../types";
import mailSuccessImg from "assets/images/illustrations/mail-success.svg";
import { RQButton } from "lib/design-system/components";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { PostSharingData } from "../types";
import "./index.scss";

interface PostSharingProps {
  postShareViewData: PostSharingData;
  setPostShareViewData: ({ type, teamData }: PostSharingData) => void;
  toggleModal: () => void;
}

export const PostSharing: React.FC<PostSharingProps> = ({ postShareViewData, setPostShareViewData, toggleModal }) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  const handleSwitchWorkspace = useCallback(() => {
    switchWorkspace(
      {
        teamId: postShareViewData.teamData.teamId,
        teamName: postShareViewData.teamData.teamName,
        teamMembersCount: postShareViewData.teamData.accessCount,
      },
      dispatch,
      {
        isWorkspaceMode,
        isSyncEnabled: true,
      },
      appMode
    ).then(() => {
      toggleModal();
    });
  }, [appMode, dispatch, isWorkspaceMode, toggleModal, postShareViewData]);

  const postSharingViews = useMemo(() => {
    return {
      [WorkspaceSharingTypes.NEW_WORKSPACE_CREATED]: {
        icon: <img src={mailSuccessImg} alt="mail sent" width={60} />,
        message: "New Workspace created and Teammates invited!",
        ctaText: "Switch to the new workspace",
        action: handleSwitchWorkspace,
      },
      [WorkspaceSharingTypes.USERS_INVITED]: {
        icon: <img src={mailSuccessImg} alt="mail sent" width={60} />,
        message: "Email invites sent!",
        ctaText: "Invite more users",
        action: () => setPostShareViewData(null), // clear post share data and go back to workspace sharing screen,
      },
      [WorkspaceSharingTypes.EXISTING_WORKSPACE]: {
        icon: <></>, //TODO: add icon
        message: `Selected rules have been copied to ${postShareViewData.teamData.teamName}`,
        ctaText: "Switch to the new workspace",
        action: handleSwitchWorkspace,
      },
    };
  }, [handleSwitchWorkspace, setPostShareViewData, postShareViewData.teamData.teamName]);

  return (
    <div className="post-sharing-wrapper">
      {postSharingViews[postShareViewData.type].icon}
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
