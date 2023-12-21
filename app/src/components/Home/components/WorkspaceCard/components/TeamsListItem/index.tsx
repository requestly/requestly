import React from "react";
import "./teamsListItem.scss";
import { Avatar, Col, Row } from "antd";
import { getUniqueColorForWorkspace } from "utils/teams";

interface Props {
  inviteId?: string;
  teamId: string;
  teamName: string;
}

export const TeamsListItem: React.FC<Props> = ({ inviteId, teamId, teamName }) => {
  return (
    <Row className="teams-list-item" justify="space-between">
      <Col>
        <Row align="middle">
          <Avatar
            size={24}
            shape="square"
            className="workspace-avatar"
            icon={teamName ? teamName?.[0]?.toUpperCase() : "W"}
            style={{
              backgroundColor: `${getUniqueColorForWorkspace(teamId ?? "", teamName)}`,
              marginRight: "8px",
            }}
          />
          <Col className="text-bold text-white teams-list-item-title">{teamName}</Col>
        </Row>
      </Col>
      <Col></Col>
    </Row>
  );
};
