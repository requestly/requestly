import React, { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { Avatar } from "antd";
import { RQButton } from "lib/design-system/components";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { getUniqueColorForWorkspace } from "utils/teams";
import { FaRegCopy } from "@react-icons/all-files/fa/FaRegCopy";
import { LockOutlined } from "@ant-design/icons";
import mailSuccessImg from "assets/images/illustrations/mail-success.svg";
import { PostShareViewData } from "../types";
import { WorkspaceSharingTypes } from "../types";
import "./index.scss";

interface PostSharingProps {
  postShareViewData: PostShareViewData;
  setPostShareViewData: ({ type, targetTeamData }: PostShareViewData) => void;
  toggleModal: () => void;
}

export const PostSharing: React.FC<PostSharingProps> = ({ postShareViewData, setPostShareViewData, toggleModal }) => {
  const dispatch = useDispatch();
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  const handleSwitchWorkspace = useCallback(() => {
    switchWorkspace(
      {
        teamId: postShareViewData.targetTeamData.teamId,
        teamName: postShareViewData.targetTeamData.teamName,
        teamMembersCount: postShareViewData.targetTeamData.accessCount,
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
        header: <img src={mailSuccessImg} alt="mail sent" width={60} />,
        message: "New Workspace created and Teammates invited!",
        ctaText: "Switch to the new workspace",
        action: handleSwitchWorkspace,
      },
      [WorkspaceSharingTypes.USERS_INVITED]: {
        header: <img src={mailSuccessImg} alt="mail sent" width={60} />,
        message: "Email invites sent!",
        ctaText: "Invite more users",
        action: () => setPostShareViewData(null), // clear post share data and go back to workspace sharing screen,
      },
      [WorkspaceSharingTypes.EXISTING_WORKSPACE]: {
        header: <WorkspaceSharingInfoHeader postShareViewData={postShareViewData} />,
        message: `Selected rules have been copied to ${postShareViewData.targetTeamData?.teamName}`,
        ctaText: "Switch to the new workspace",
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
      <div>
        {!sourceTeamData.id ? (
          <div className="sharing-flow-cta-workspace-avatar">
            <Avatar
              size={35}
              shape="square"
              icon={<LockOutlined />}
              className="workspace-avatar"
              style={{ backgroundColor: "#1E69FF" }}
            />
            <div className="mt-8">Private workspace</div>
          </div>
        ) : null}
      </div>
      <FaRegCopy className="header text-gray" />
      <div className="sharing-flow-cta-workspace-avatar">
        <Avatar
          size={35}
          shape="square"
          icon={targetTeamData.teamName ? targetTeamData.teamName?.[0]?.toUpperCase() : "W"}
          className="workspace-avatar"
          style={{
            backgroundColor: getUniqueColorForWorkspace(targetTeamData.teamId ?? "", targetTeamData.teamName),
          }}
        />
        <div className="mt-8">{targetTeamData.teamName}</div>
      </div>
    </div>
  );
};
