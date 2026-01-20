import React, { useState } from "react";
import { Col, Typography } from "antd";
import { TeamCard } from "../teamCard";
import { Invite } from "types";
import "./index.scss";

interface JoinTeamViewProps {
  pendngInvites: Invite[];
}

export const JoinTeamView: React.FC<JoinTeamViewProps> = ({ pendngInvites }) => {
  // TEMP: allow only one team to be joined
  const [joiningTeamId, setJoiningTeamId] = useState(null);
  return (
    <Col className="teams-onboarding-view">
      <Col className="getting-started-teams-wrapper">
        <Col className="getting-started-join-teams-view">
          <Typography.Title level={5} className="text-white" style={{ fontWeight: 500 }}>
            We found your team on Requestly
          </Typography.Title>
          <Typography.Text className="getting-started-join-teams-description">
            Join your team’s workspaces and get access to shared rules, mock APIs, session replays, and more.
          </Typography.Text>
          <Col className="getting-started-join-teams-list">
            {pendngInvites.map((invite, index) => (
              <TeamCard invite={invite} joiningTeamId={joiningTeamId} setJoiningTeamId={setJoiningTeamId} key={index} />
            ))}
          </Col>

          {/* <RQButton
            block
            icon={<PlusOutlined />}
            className="getting-started-create-new-workspace-btn"
            onClick={() => {
              dispatch(
                actions.toggleActiveModal({
                  modalName: "createWorkspaceModal",
                  newValue: true,
                  newProps: {
                    source: "app_onboarding",
                  },
                })
              );
            }}
          >
            Create new workspace
          </RQButton> */}
        </Col>
      </Col>
    </Col>
  );
};
