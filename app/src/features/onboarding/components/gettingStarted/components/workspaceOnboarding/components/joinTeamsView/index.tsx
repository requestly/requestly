import React from "react";
import { useDispatch } from "react-redux";
import { Col, Typography } from "antd";
import { TeamCard } from "../teamCard";
import { actions } from "store";
import { RQButton } from "lib/design-system/components";
import { PlusOutlined } from "@ant-design/icons";
import { Invite } from "types";
import "./index.scss";

interface JoinTeamViewProps {
  pendngInvites: Invite[];
}

export const JoinTeamView: React.FC<JoinTeamViewProps> = ({ pendngInvites }) => {
  const dispatch = useDispatch();
  return (
    <Col className="getting-started-join-teams-view">
      <Typography.Title level={5} className="text-white" style={{ fontWeight: 500 }}>
        We found your team on requestly
      </Typography.Title>
      <Typography.Text className="getting-started-join-teams-description">
        Join your team’s workspaces and get access to shared rules, mock APIs, session replays, and more.
      </Typography.Text>
      <Col className="getting-started-join-teams-list">
        {pendngInvites.map((invite) => (
          <TeamCard invite={invite} />
        ))}
      </Col>
      <RQButton
        icon={<PlusOutlined />}
        style={{ marginTop: "12px" }}
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
      </RQButton>
    </Col>
  );
};
