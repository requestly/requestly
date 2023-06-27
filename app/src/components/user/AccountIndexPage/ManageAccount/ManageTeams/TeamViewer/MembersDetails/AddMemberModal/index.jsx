import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "utils/Toast.js";
import { Button, Row, Col } from "antd";
import { getAvailableTeams, getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import isEmail from "validator/lib/isEmail";
import { ReactMultiEmail, isEmail as validateEmail } from "react-multi-email";
import { getFunctions, httpsCallable } from "firebase/functions";
import { RQModal } from "lib/design-system/components";
import MemberRoleDropdown from "../../common/MemberRoleDropdown";
import LearnMoreAboutWorkspace from "../../common/LearnMoreAboutWorkspace";
import { trackAddTeamMemberFailure, trackAddTeamMemberSuccess } from "modules/analytics/events/features/teams";
import "react-multi-email/style.css";
import "./AddMemberModal.css";
import { trackAddMembersInWorkspaceModalViewed } from "modules/analytics/events/common/teams";
import InviteErrorModal from "./InviteErrorModal";

const AddMemberModal = ({ isOpen, handleModalClose, callback, teamId: currentTeamId }) => {
  //Component State
  const [userEmail, setUserEmail] = useState([]);
  const [makeUserAdmin, setMakeUserAdmin] = useState(false);
  const [isInviteErrorModalActive, setInviteErrorModalActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inviteErrors, setInviteErrors] = useState([]);

  // Global state
  const availableTeams = useSelector(getAvailableTeams);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const { id: activeWorkspaceId } = currentlyActiveWorkspace;
  const teamId = currentTeamId ?? activeWorkspaceId;
  const teamDetails = availableTeams?.find((team) => team.id === teamId);

  const toggleInviteEmailModal = () => {
    setInviteErrorModalActive(!isInviteErrorModalActive);
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
        trackAddTeamMemberFailure(teamId, userEmail, "invalid_email", "add_member_modal");
        return;
      }
    }

    const functions = getFunctions();
    const createTeamInvites = httpsCallable(functions, "invites-createTeamInvites");
    setIsProcessing(true);

    createTeamInvites({
      teamId: teamId,
      emails: userEmail,
      role: makeUserAdmin ? "admin" : "write",
    })
      .then((res) => {
        if (res?.data?.success) {
          toast.success("Sent invites successfully");
          callback?.();
          trackAddTeamMemberSuccess(teamId, userEmail, makeUserAdmin, "add_member_modal");
          setIsProcessing(false);
          handleModalClose();
        } else {
          const inviteErrors = res?.data?.results.filter((result) => result?.success !== true);
          callback?.();
          setInviteErrors([...inviteErrors]);
          setInviteErrorModalActive(true);
          trackAddTeamMemberFailure(teamId, userEmail, null, "add_member_modal");
          setIsProcessing(false);
        }
      })
      .catch((err) => {
        toast.error("Error while creating invitations. Make sure you are an admin");
        trackAddTeamMemberFailure(teamId, userEmail, null, "add_member_modal");
      });
  };

  useEffect(() => {
    if (isOpen) trackAddMembersInWorkspaceModalViewed();
  }, [isOpen]);

  return (
    <>
      <RQModal centered open={isOpen} onCancel={handleModalClose}>
        <div className="rq-modal-content">
          <div>
            <img alt="smile" width="48px" height="44px" src="/assets/img/workspaces/smiles.svg" />
          </div>
          <div className="header add-member-modal-header">
            Invite people to {currentTeamId ? `${teamDetails?.name}` : ""} workspace
          </div>
          <p className="text-gray">Get the most out of Requestly by inviting your teammates.</p>

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
                <span title="Remove" data-tag-handle onClick={() => removeEmail(index)}>
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
            <div>Workspaces enable you to organize and collaborate on rules within your team.</div>
          </div>
        </div>

        <Row align="middle" justify="space-between" className="rq-modal-footer">
          <Col>
            <LearnMoreAboutWorkspace linkText="Learn more about team workspaces" />
          </Col>
          <Col>
            <Button type="primary" htmlType="submit" onClick={handleAddMember} loading={isProcessing}>
              Invite People
            </Button>
          </Col>
        </Row>
      </RQModal>

      <InviteErrorModal
        isOpen={isInviteErrorModalActive}
        handleModalClose={toggleInviteEmailModal}
        errors={inviteErrors}
        teamId={teamId}
        isAdmin={makeUserAdmin}
      />
    </>
  );
};

export default AddMemberModal;
