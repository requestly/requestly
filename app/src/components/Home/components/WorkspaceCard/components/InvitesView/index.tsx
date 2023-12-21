import React from "react";
import { Col, Typography } from "antd";
import { Invite } from "types";
import { TeamsListItem } from "../TeamsListItem";
import "./invitesView.scss";

interface Props {
  pendingInvites: Invite[];
}

export const InvitesView: React.FC<Props> = ({ pendingInvites }) => {
  return (
    <>
      <Typography.Text className="homepage-invites-title">We found your team on Requestly</Typography.Text>
      <Col>
        <Typography.Text className="mt-8 homepage-invites-subtitle">
          Join your team’s workspaces and access shared rules, mock APIs, replays, and more.{" "}
        </Typography.Text>
        <Col className="homepage-teams-list">
          {pendingInvites.map((invite: Invite) => (
            <TeamsListItem
              inviteId={invite.id}
              teamId={invite.metadata.teamId as string}
              teamName={invite.metadata.teamName as string}
            />
          ))}
        </Col>
      </Col>
    </>
  );
};
