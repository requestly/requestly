import React, { useCallback, useState } from "react";
import { Avatar, Spin } from "antd";
import { RQButton } from "lib/design-system/components";
import { Invite } from "types";
import { acceptTeamInvite } from "backend/workspace";
import { toast } from "utils/Toast";
import Logger from "lib/logger";
import { LoadingOutlined } from "@ant-design/icons";
import { BiCheckCircle } from "@react-icons/all-files/bi/BiCheckCircle";
import { trackWorkspaceInviteAccepted, trackWorkspaceJoinClicked } from "modules/analytics/events/features/teams";
import "./index.scss";

interface TeamCardProps {
  invite: Invite & { metadata?: any };
}

export const TeamCard: React.FC<TeamCardProps> = ({ invite }) => {
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState<boolean>(false);

  const handleJoining = useCallback(() => {
    trackWorkspaceJoinClicked(invite?.metadata?.teamId, "app_onboarding");
    setIsJoining(true);
    acceptTeamInvite(invite.id)
      .then((res) => {
        if (res?.data?.success) {
          toast.success("Team joined successfully");
          setHasJoined(true);
          trackWorkspaceInviteAccepted(
            invite?.metadata?.teamId,
            invite?.metadata?.teamName,
            invite?.id,
            "app_onboarding",
            res?.data?.data?.invite?.usage,
            res?.data?.data?.invite?.metadata?.teamAccessCount
          );
        }
      })
      .catch((e) => {
        Logger.error(e);
        toast.error("Something went wrong, please try again");
      })
      .finally(() => {
        setIsJoining(false);
      });
  }, [invite.id, invite?.metadata?.teamId, invite?.metadata?.teamName]);

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
          <RQButton onClick={handleJoining} className={`${isJoining ? "team-card-join-btn-dark-bg" : ""}`}>
            {isJoining ? <Spin indicator={<LoadingOutlined className="team-card-join-btn-loader" spin />} /> : "Join"}
          </RQButton>
        )}
      </div>
    </div>
  );
};
