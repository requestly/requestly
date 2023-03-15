import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "utils/Toast.js";
import { Button, Row, Col } from "antd";
import {
  getAvailableTeams,
  getCurrentlyActiveWorkspace,
} from "store/features/teams/selectors";
import isEmail from "validator/lib/isEmail";
import { ReactMultiEmail, isEmail as validateEmail } from "react-multi-email";
import { getFunctions, httpsCallable } from "firebase/functions";
import InviteMemberModal from "./InviteMemberModal";
import { RQModal } from "lib/design-system/components";
import MemberRoleDropdown from "../../common/MemberRoleDropdown";
import LearnMoreAboutWorkspace from "../../common/LearnMoreAboutWorkspace";
import {
  trackAddTeamMemberFailure,
  trackAddTeamMemberSuccess,
} from "modules/analytics/events/features/teams";
import "react-multi-email/style.css";
import "./AddMemberModal.css";

const AddMemberModal = ({
  isOpen,
  handleModalClose,
  callback,
  teamId: currentTeamId,
}) => {
  //Component State
  const [userEmail, setUserEmail] = useState([]);
  const [makeUserAdmin, setMakeUserAdmin] = useState(false);
  const [isInviteEmailModalActive, setIsInviteEmailModalActive] = useState(
    false
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [unsuccessfulUserAdditions, setUnsuccessfulUserAdditions] = useState(
    []
  );

  // Global state
  const availableTeams = useSelector(getAvailableTeams);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const { id: activeWorkspaceId } = currentlyActiveWorkspace;
  const teamId = currentTeamId ?? activeWorkspaceId;
  const teamsDetails = availableTeams?.find((team) => team.id === teamId);

  const toggleInviteEmailModal = () => {
    setIsInviteEmailModalActive(!isInviteEmailModalActive);
    handleModalClose();
  };

  const handleAddMember = () => {
    if (!userEmail || userEmail.length === 0) {
      toast.warn(`Invalid Email`);
      return;
    }
    for (const email of userEmail) {
      if (!isEmail(email)) {
        toast.warn(`${email} is not a valid email`);
        trackAddTeamMemberFailure(teamId, userEmail, "invalid_email");
        return;
      }
    }

    const functions = getFunctions();
    const addUserToTeam = httpsCallable(functions, "addUserToTeam");

    // For loading icon
    setIsProcessing(true);

    addUserToTeam({
      teamId: teamId,
      email: userEmail,
      isAdmin: makeUserAdmin,
    })
      .then((res) => {
        if (res.data.success) {
          toast.success("Users added successfully");
          callback?.();
          trackAddTeamMemberSuccess(teamId, userEmail, makeUserAdmin);
          setIsProcessing(false);
          handleModalClose();
        }
      })
      .catch((err) => {
        if (err.message === "user-not-found") {
          const invalidEmails = JSON.parse(JSON.stringify(err)).details;
          callback?.();
          setUnsuccessfulUserAdditions([...invalidEmails]);
          setIsInviteEmailModalActive(true);
          trackAddTeamMemberFailure(teamId, userEmail, "user_not_found");
          setIsProcessing(false);
        } else if (err.message === "user-already-exists") {
          toast.warn(`User already has access to the team`);
          handleModalClose();
          trackAddTeamMemberFailure(teamId, userEmail, "user_already_exist");
        } else if (err.message === "user-not-admin") {
          toast.warn("Opps! Make sure you are an admin");
          handleModalClose();
        } else {
          toast.warn(`Trouble adding users`);
          trackAddTeamMemberFailure(teamId, userEmail, "other");
          handleModalClose();
        }
      });
  };

  return (
    <>
      <RQModal centered open={isOpen} onCancel={handleModalClose}>
        <div className="rq-modal-content">
          <div>
            <img
              alt="smile"
              width="48px"
              height="44px"
              src="/assets/img/workspaces/smiles.svg"
            />
          </div>
          <div className="header add-member-modal-header">
            Add people to {currentTeamId ? `${teamsDetails?.name}'s` : ""}{" "}
            workspace
          </div>
          <p className="text-gray">
            Get the most out of Requestly by inviting your teammates.
          </p>

          <label className="text-bold text-sm add-member-modal-email-label">
            Email address
          </label>
          <ReactMultiEmail
            className="members-email-input"
            placeholder="Email Address"
            type="email"
            value={userEmail}
            onChange={setUserEmail}
            validateEmail={validateEmail}
            getLabel={(email, index, removeEmail) => (
              <div data-tag key={index} className="multi-email-tag">
                {email}
                <span
                  title="Remove"
                  data-tag-handle
                  onClick={() => removeEmail(index)}
                >
                  <img alt="remove" src="/assets/img/workspaces/cross.svg" />
                </span>
              </div>
            )}
          />

          <Row className="access-dropdown-container">
            <Col span={24} align="right">
              <MemberRoleDropdown
                placement="bottomRight"
                isAdmin={makeUserAdmin}
                handleMemberRoleChange={(isAdmin) => setMakeUserAdmin(isAdmin)}
              />
            </Col>
          </Row>
          <div className="text-gray add-members-modal-info-text">
            <div>
              Workspaces enable you to organize and collaborate on rules within
              your team.
            </div>
          </div>
        </div>

        <Row align="middle" justify="space-between" className="rq-modal-footer">
          <Col>
            <LearnMoreAboutWorkspace linkText="Learn more about team workspaces" />
          </Col>
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              onClick={handleAddMember}
              loading={isProcessing}
            >
              Add members
            </Button>
          </Col>
        </Row>
      </RQModal>

      <InviteMemberModal
        isOpen={isInviteEmailModalActive}
        handleModalClose={toggleInviteEmailModal}
        emails={unsuccessfulUserAdditions}
        teamId={teamId}
        isAdmin={makeUserAdmin}
      />
    </>
  );
};

export default AddMemberModal;
