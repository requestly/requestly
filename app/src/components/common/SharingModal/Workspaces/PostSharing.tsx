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
  postShareData: PostSharingData;
  setPostShareData: ({ type, teamData }: PostSharingData) => void;
  toggleModal: () => void;
}

export const PostSharing: React.FC<PostSharingProps> = ({ postShareData, setPostShareData, toggleModal }) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  const handleSwitchWorkspace = useCallback(() => {
    switchWorkspace(
      {
        teamId: postShareData.teamData.teamId,
        teamName: postShareData.teamData.teamName,
        teamMembersCount: postShareData.teamData.accessCount,
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
  }, [appMode, dispatch, isWorkspaceMode, toggleModal, postShareData]);

  const postSharingData = useMemo(() => {
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
        action: () => setPostShareData(null),
      },
      [WorkspaceSharingTypes.EXISTING_WORKSPACE]: {
        icon: <></>, //TODO: add icon
        message: `Selected rules have been copied to ${postShareData.teamData.teamName}`,
        ctaText: "Switch to the new workspace",
        action: handleSwitchWorkspace,
      },
    };
  }, [handleSwitchWorkspace, setPostShareData, postShareData.teamData.teamName]);

  return (
    <div className="post-sharing-wrapper">
      {postSharingData[postShareData.type].icon}
      <div className="subheader">{postSharingData[postShareData.type].message}</div>
      <RQButton type="primary" className="sharing-primary-btn" onClick={postSharingData[postShareData.type].action}>
        {postSharingData[postShareData.type].ctaText}
      </RQButton>
    </div>
  );
};
