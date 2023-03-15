import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Col, Row, Button, Typography, Input, Switch, Divider } from "antd";
import { getAvailableTeams } from "store/features/teams/selectors";
//Firebase
import TeamMembersTable from "./TeamMembersTable";
import { getFunctions, httpsCallable } from "firebase/functions";
// Icons
import { PlusOutlined } from "@ant-design/icons";
// Sub Components
import AddMemberModal from "./AddMemberModal";
import { trackAddMemberClicked } from "modules/analytics/events/common/teams";
import LearnMoreAboutWorkspace from "../common/LearnMoreAboutWorkspace";
import "./MembersDetails.css";

const MembersDetails = ({ teamId, isTeamAdmin }) => {
  const location = useLocation();
  const isNewTeam = location.state?.isNewTeam;
  // Component state
  const [seats, setSeats] = useState({});
  const [showSeatStatus, setShowSeatStatus] = useState(false);
  const [isAddMemberModalActive, setIsAddMemberModalActive] = useState(false);
  const [refreshTeamMembersTable, setRefreshTeamMembersTable] = useState(false);

  // Global state
  const availableTeams = useSelector(getAvailableTeams);
  const teamDetails = availableTeams?.find((team) => team.id === teamId) ?? {};
  const { accessCount } = teamDetails;

  // To handle refresh in TeamMembersTable
  const doRefreshTeamMembersTable = () => {
    setRefreshTeamMembersTable(!refreshTeamMembersTable);
  };

  const toggleAddMemberModal = () => {
    setIsAddMemberModalActive(!isAddMemberModalActive);
  };

  const handleAddMemberClick = () => {
    setIsAddMemberModalActive(true);
    trackAddMemberClicked();
  };

  useEffect(() => {
    if (isNewTeam) {
      setIsAddMemberModalActive(true);
    }
  }, [isNewTeam]);

  useEffect(() => {
    const functions = getFunctions();
    const getTeamBillingUsers = httpsCallable(functions, "getTeamBillingUsers");

    getTeamBillingUsers({
      teamId,
    })
      .then((res) => {
        const seatsData = res.data;
        if (seatsData.success) {
          setSeats({
            billQuantity: seatsData.billQuantity, // quantity passed to stripe to bill
            actualBillQuantity: seatsData.actualBillQuantity, // total number of users
          });
          setShowSeatStatus(true);
        }
      })
      .catch(() => setShowSeatStatus(false));
  }, [teamId, refreshTeamMembersTable]);

  // DO NOT CHANGE
  const __INVITE_LINK_FEATURE_WORK_IN_PROGRESS__ = true;

  return (
    <div className="members-details-container">
      {/* invite */}
      {__INVITE_LINK_FEATURE_WORK_IN_PROGRESS__ ? null : (
        <>
          <Row>
            <Col span={24}>
              <LearnMoreAboutWorkspace
                linkText="Learn about adding members to your
                workspace"
              />

              <Row align="middle" justify="space-between">
                <Col className="header members-invite-title">Invite link</Col>
                <Col className="ml-auto">
                  <Switch onChange={() => {}} />
                </Col>
              </Row>

              <p className="text-dark-gray members-info-message">
                Share this secret link to invite people to this workspace. Only
                users who can invite members can see this. You can{" "}
                {/* eslint-disable-next-line */}
                <a href="#">reset the link</a> for all space members to generate
                a new invite link.
              </p>
            </Col>

            <Input.Group compact>
              <Input className="invite-link-input" />
              <Button type="primary">Copy link</Button>
            </Input.Group>
          </Row>

          <Divider className="manage-workspace-divider" />
        </>
      )}

      {/* members table */}
      <Row>
        <Col>
          <div className="title members-details-title">
            {accessCount > 1 ? `${accessCount} Members` : "Workspace Members"}
          </div>

          <p className="text-dark-gray members-info-message">
            Team workspaces enable you to share rules with collaborators and
            manage access within your team. <br />
            By collaborating in a workspace, your edits sync with your team in
            real time.
          </p>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button
            disabled={!isTeamAdmin}
            type="primary"
            onClick={handleAddMemberClick}
          >
            <PlusOutlined />{" "}
            <span className="text-bold caption">Add Member</span>
          </Button>
        </Col>
      </Row>

      <div className="members-table-container">
        <TeamMembersTable
          teamId={teamId}
          isTeamAdmin={isTeamAdmin}
          refresh={refreshTeamMembersTable}
          callback={doRefreshTeamMembersTable}
        />
        {isTeamAdmin && (
          <>
            {accessCount === 1 ? (
              <p className="members-invite-message">
                You are the only member in this workspace, add more members to
                collaborate.
              </p>
            ) : 1 < accessCount && accessCount <= 3 ? (
              <p className="members-invite-message">
                There are only a few members in this workspace, add more members
                to collaborate.
              </p>
            ) : null}
          </>
        )}

        {/* invite banner */}
        {isTeamAdmin && (
          <div
            onClick={handleAddMemberClick}
            className="members-invite-empty-container"
          >
            <div>
              <img
                alt="smiles"
                width="48px"
                height="44px"
                src="/assets/img/workspaces/smiles.svg"
              />
            </div>
            <span className="header text-gray">Invite people</span>
            <span className="text-gray">
              Get the most out of Requestly by inviting your teammates.
            </span>
          </div>
        )}
      </div>

      <Row align="middle" justify="center" className="members-quantity-info">
        {showSeatStatus ? (
          <Typography.Text
            strong
            className="text-sm text-dark-gray text-center"
          >
            {`You currently have ${seats.actualBillQuantity} active users. Feel free to add more.`}
          </Typography.Text>
        ) : null}
      </Row>

      {isAddMemberModalActive ? (
        <AddMemberModal
          teamId={teamId}
          isOpen={isAddMemberModalActive}
          handleModalClose={toggleAddMemberModal}
          callback={doRefreshTeamMembersTable}
        />
      ) : null}
    </div>
  );
};

export default MembersDetails;
