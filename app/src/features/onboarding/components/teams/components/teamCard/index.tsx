import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { Avatar, Spin } from "antd";
import { RQButton } from "lib/design-system/components";
import { Invite } from "types";
import { acceptTeamInvite } from "backend/workspace";
import { toast } from "utils/Toast";
import Logger from "lib/logger";
import { LoadingOutlined } from "@ant-design/icons";
import { BiCheckCircle } from "@react-icons/all-files/bi/BiCheckCircle";
import { trackWorkspaceInviteAccepted, trackWorkspaceJoinClicked } from "modules/analytics/events/features/teams";
import { globalActions } from "store/slices/global/slice";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { isNull } from "lodash";
import "./index.scss";
import { redirectToWebAppHomePage } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";

interface TeamCardProps {
  invite: Invite & { metadata?: any };
  joiningTeamId: string;
  setJoiningTeamId: (teamId: string) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ invite, joiningTeamId, setJoiningTeamId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const appMode = useSelector(getAppMode);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState<boolean>(false);

  const handleJoining = useCallback(() => {
    trackWorkspaceJoinClicked(invite?.metadata?.teamId, "app_onboarding");
    setJoiningTeamId(invite?.metadata?.teamId);
    setIsJoining(true);
    acceptTeamInvite(invite.id)
      .then((res) => {
        if (res?.success) {
          toast.success("Team joined successfully");
          setHasJoined(true);
          switchWorkspace(
            {
              teamId: invite?.metadata?.teamId,
              teamName: invite?.metadata?.teamName,
              teamMembersCount: res?.data?.invite?.metadata?.teamAccessCount,
            },
            dispatch,
            {
              isWorkspaceMode: isSharedWorkspaceMode,
              isSyncEnabled: true,
            },
            appMode,
            null,
            "onboarding"
          );
          trackWorkspaceInviteAccepted(
            invite?.metadata?.teamId,
            invite?.metadata?.teamName,
            invite?.id,
            "app_onboarding",
            res?.data?.invite?.usage,
            res?.data?.invite?.metadata?.teamAccessCount
          );
        }
        redirectToWebAppHomePage(navigate);
        dispatch(globalActions.updateAppOnboardingCompleted());
        dispatch(
          globalActions.toggleActiveModal({
            modalName: "appOnboardingModal",
            newValue: false,
          })
        );
      })
      .catch((e) => {
        Logger.error(e);
        toast.error("Something went wrong, please try again");
        setJoiningTeamId(null);
      })
      .finally(() => {
        setIsJoining(false);
        setJoiningTeamId(null);
      });
  }, [
    invite?.metadata?.teamId,
    invite?.metadata?.teamName,
    invite.id,
    setJoiningTeamId,
    navigate,
    dispatch,
    isSharedWorkspaceMode,
    appMode,
  ]);

  return (
    <div className="team-card-wrapper">
      <div className="team-card-team-info-wrapper">
        <Avatar
          size={32}
          shape="square"
          className="workspace-avatar"
          icon={<>{(invite?.metadata?.teamName || "").charAt(0)?.toUpperCase()}</>}
        />
        <div>
          <div className="team-card-team-name">{invite.metadata?.teamName}</div>
          <div className="team-card-team-members-count">{invite.metadata?.teamAccessCount} members</div>
        </div>
      </div>
      <div className="team-card-join-btn-wrapper">
        {hasJoined ? (
          <div className="team-card-joined-tag">
            <BiCheckCircle />
            <span>Joined</span>
          </div>
        ) : (
          <RQButton
            disabled={joiningTeamId !== invite?.metadata?.teamId && !isNull(joiningTeamId)}
            onClick={handleJoining}
            className={`${isJoining ? "team-card-join-btn-dark-bg" : ""}`}
          >
            {isJoining ? <Spin indicator={<LoadingOutlined className="team-card-join-btn-loader" spin />} /> : "Join"}
          </RQButton>
        )}
      </div>
    </div>
  );
};
