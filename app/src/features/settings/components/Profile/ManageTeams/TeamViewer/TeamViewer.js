import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Row, Col, Tabs, Alert } from "antd";
import MembersDetails from "./MembersDetails";
import TeamSettings from "./TeamSettings";
import BillingDetails from "./BillingDetails";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { trackWorkspaceSettingToggled } from "modules/analytics/events/common/teams";
import SwitchWorkspaceButton from "./SwitchWorkspaceButton";
import { useIsTeamAdmin } from "./hooks/useIsTeamAdmin";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getAllWorkspaces } from "store/slices/workspaces/selectors";
import WorkspaceAvatar from "features/workspaces/components/WorkspaceAvatar";
import { WorkspaceType } from "features/workspaces/types";
import { LocalWorkspaceSettings } from "./LocalWorkspaceSettings/LocalWorkspaceSettings";
import "./TeamViewer.css";
import { redirectTo404 } from "utils/RedirectionUtils";

const TeamViewer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { teamId } = useParams();
  const { isTeamAdmin } = useIsTeamAdmin(teamId);
  const availableWorkspaces = useSelector(getAllWorkspaces);
  const user = useSelector(getUserAuthDetails);
  const isAppSumoDeal = user?.details?.planDetails?.type === "appsumo";

  const teamDetails = useMemo(() => availableWorkspaces?.find((team) => team.id === teamId), [
    availableWorkspaces,
    teamId,
  ]);
  const name = teamDetails?.name;
  const teamOwnerId = teamDetails?.owner;
  const isTeamArchived = teamDetails?.archived;
  const teamMembersCount = teamDetails?.accessCount;
  const isLocalWorkspace = teamDetails?.workspaceType === WorkspaceType.LOCAL;

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
        disabled: !["active", "trialing", "past_due"].includes(teamDetails?.subscriptionStatus) || isAppSumoDeal,
        label: (
          <span className="billing-tab-label">
            <>
              Plans & Billings <QuestionCircleOutlined />
            </>
          </span>
        ),
        children: <BillingDetails key={teamId} teamId={teamId} isTeamAdmin={isTeamAdmin} teamDetails={teamDetails} />,
      },
    ],
    [teamId, teamOwnerId, isTeamArchived, isTeamAdmin, teamDetails, isAppSumoDeal]
  );

  if (!teamDetails) {
    if (!(location?.state && location.state.previousPath)) {
      redirectTo404(navigate);
    }
    return null;
  }

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
              <WorkspaceAvatar workspace={teamDetails} size={28} />{" "}
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

        {isLocalWorkspace ? (
          <LocalWorkspaceSettings workspaceId={teamId} workspacePath={teamDetails?.rootPath} />
        ) : (
          <Tabs
            defaultActiveKey="0"
            items={manageWorkspaceItems}
            className="manage-workspace-tabs"
            onChange={(activeTab) => {
              trackWorkspaceSettingToggled(activeTab);
            }}
          />
        )}
      </Col>
    </Row>
  );
};

export default TeamViewer;
