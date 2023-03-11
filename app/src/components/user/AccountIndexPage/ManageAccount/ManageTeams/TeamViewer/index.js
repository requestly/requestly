import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Row, Col, Avatar, Tabs } from "antd";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAvailableTeams } from "store/features/teams/selectors";
import MembersDetails from "./MembersDetails";
import TeamSettings from "./TeamSettings";
import BillingDetails from "./BillingDetails";
import { QuestionCircleOutlined } from "@ant-design/icons";
import "./TeamViewer.css";

const TeamViewer = ({ teamId }) => {
  // Component State
  // const navigate = useNavigate();
  const [isTeamAdmin, setIsTeamAdmin] = useState(false);

  // Global State
  const availableTeams = useSelector(getAvailableTeams);
  const teamDetails = availableTeams?.find((team) => team.id === teamId);
  const name = teamDetails?.name;

  // const params = new URLSearchParams(window.location.search);
  // const redirectBackToMyTeams = params.has("redirectBackToMyTeams")
  //   ? params.get("redirectBackToMyTeams") === "true"
  //   : false;

  // const handleBackButton = () => {
  //   if (redirectBackToMyTeams) {
  //     redirectToMyTeams(navigate);
  //   } else {
  //     redirectToRules(navigate);
  //   }
  // };

  useEffect(() => {
    const functions = getFunctions();
    const getIsTeamAdmin = httpsCallable(functions, "isTeamAdmin");

    getIsTeamAdmin({
      teamId,
    }).then((res) => {
      const response = res.data;
      if (response.success) {
        setIsTeamAdmin(response.isAdmin);
      }
    });
  }, [teamId]);

  const manageWorkspaceItems = useMemo(
    () => [
      {
        key: "0",
        label: "Members",
        children: <MembersDetails key={teamId} teamId={teamId} />,
      },
      {
        key: "1",
        label: "Settings",
        children: <TeamSettings key={teamId} teamId={teamId} />,
      },
      {
        key: "2",
        label: (
          <span className="billing-tab-label">
            Plans & Billings <QuestionCircleOutlined />
          </span>
        ),
        children: (
          <BillingDetails
            key={teamId}
            teamId={teamId}
            isTeamAdmin={isTeamAdmin}
          />
        ),
      },
    ],
    [teamId, isTeamAdmin]
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
        <Row align="middle" className="manage-workspace-header-container">
          <Col>
            <Row
              wrap={false}
              align="middle"
              className="manage-workspace-header"
            >
              <Avatar
                size={28}
                shape="square"
                icon={name ? name?.[0]?.toUpperCase() : "P"}
              />{" "}
              <span className="header">
                Manage your {name ?? "private"} workspace
              </span>
            </Row>
          </Col>
        </Row>

        <Tabs
          defaultActiveKey="0"
          items={manageWorkspaceItems}
          className="manage-workspace-tabs"
        />
      </Col>
    </Row>
  );
};

export default TeamViewer;
