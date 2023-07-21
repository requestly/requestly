import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Row, Col, Avatar, Tabs, Alert } from "antd";
import { getAvailableTeams } from "store/features/teams/selectors";
import MembersDetails from "./MembersDetails";
import TeamSettings from "./TeamSettings";
import BillingDetails from "./BillingDetails";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { getUniqueColorForWorkspace } from "utils/teams";
import { trackWorkspaceSettingToggled } from "modules/analytics/events/common/teams";
import SwitchWorkspaceButton from "./SwitchWorkspaceButton";
import { useIsTeamAdmin } from "./hooks/useIsTeamAdmin";
import "./TeamViewer.css";

const TeamViewer = () => {
  const { teamId } = useParams();
  const { isTeamAdmin } = useIsTeamAdmin(teamId);
  const availableTeams = useSelector(getAvailableTeams);
  const teamDetails = availableTeams?.find((team) => team.id === teamId) ?? {};
  const name = teamDetails?.name;
  const teamOwnerId = teamDetails?.owner;
  const isTeamArchived = teamDetails?.archived;
  const teamMembersCount = teamDetails?.accessCount;

  const manageWorkspaceItems = useMemo(
    () => [
      {
        key: "Members",
        label: "Members",
        children: <MembersDetails key={teamId} teamId={teamId} isTeamAdmin={isTeamAdmin} />,
      },
      {
        key: "Workspace settings",
        label: "Workspace settings",
        children: (
          <TeamSettings
            key={teamId}
            teamId={teamId}
            teamOwnerId={teamOwnerId}
            isTeamAdmin={isTeamAdmin}
            isTeamArchived={isTeamArchived}
          />
        ),
      },
      {
        key: "Plans & Billings",
        label: (
          <span className="billing-tab-label">
            <>
              Plans & Billings <QuestionCircleOutlined />
            </>
          </span>
        ),
        children: <BillingDetails key={teamId} teamId={teamId} isTeamAdmin={isTeamAdmin} />,
      },
    ],
    [teamId, teamOwnerId, isTeamArchived, isTeamAdmin]
  );

  return (
    <Row className="manage-workspace-container">
      <Col
        xs={{ offset: 1, span: 22 }}
        sm={{ offset: 1, span: 22 }}
        md={{ offset: 2, span: 20 }}
        lg={{ offset: 3, span: 18 }}
        xl={{ offset: 4, span: 16 }}
        flex="1 1 820px"
      >
        {isTeamArchived ? (
          <Alert
            showIcon
            closable
            type="warning"
            className="workspace-delete-scheduled-alert"
            message="Your workspace has been scheduled for deletion"
            description="We have scheduled your workspace for deletion in 48 hours. You will receive an email confirmation when it has completed."
          />
        ) : null}

        <Row align="middle" justify="space-between" className="manage-workspace-header-container">
          <Col>
            <Row wrap={false} align="middle" className="manage-workspace-header">
              <Avatar
                size={28}
                shape="square"
                icon={name ? name?.[0]?.toUpperCase() : "P"}
                style={{
                  backgroundColor: `${getUniqueColorForWorkspace(teamId, name)}`,
                }}
              />{" "}
              <span className="header">Manage {name ?? "private"} workspace</span>
            </Row>
          </Col>
          <Col>
            <Row wrap={false} align="middle" className="manage-workspace-header">
              <SwitchWorkspaceButton
                teamName={name}
                selectedTeamId={teamId}
                teamMembersCount={teamMembersCount}
                isTeamArchived={isTeamArchived}
              />
            </Row>
          </Col>
        </Row>

        <Tabs
          defaultActiveKey="0"
          items={manageWorkspaceItems}
          className="manage-workspace-tabs"
          onChange={(activeTab) => {
            trackWorkspaceSettingToggled(activeTab);
          }}
        />
      </Col>
    </Row>
  );
};

export default TeamViewer;
