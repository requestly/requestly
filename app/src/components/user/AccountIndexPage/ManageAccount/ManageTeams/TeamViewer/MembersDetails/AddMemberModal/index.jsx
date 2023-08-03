import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "utils/Toast.js";
import { Row, Checkbox } from "antd";
import { getAvailableTeams, getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { getUserAuthDetails } from "store/selectors";
import isEmail from "validator/lib/isEmail";
import { ReactMultiEmail, isEmail as validateEmail } from "react-multi-email";
import { getFunctions, httpsCallable } from "firebase/functions";
import { RQButton, RQInput, RQModal } from "lib/design-system/components";
import MemberRoleDropdown from "../../common/MemberRoleDropdown";
import CopyButton from "components/misc/CopyButton";
import { trackAddTeamMemberFailure, trackAddTeamMemberSuccess } from "modules/analytics/events/features/teams";
import { trackAddMembersInWorkspaceModalViewed } from "modules/analytics/events/common/teams";
import InviteErrorModal from "./InviteErrorModal";
import PageLoader from "components/misc/PageLoader";
import { useIsTeamAdmin } from "../../hooks/useIsTeamAdmin";
import { getDomainFromEmail } from "utils/FormattingHelper";
import "react-multi-email/style.css";
import "./AddMemberModal.css";

const AddMemberModal = ({ isOpen, toggleModal, callback, teamId: currentTeamId }) => {
  //Component State
  const [userEmail, setUserEmail] = useState([]);
  const [makeUserAdmin, setMakeUserAdmin] = useState(false);
  const [isInviteErrorModalActive, setInviteErrorModalActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inviteErrors, setInviteErrors] = useState([]);
  const [isDomainJoiningEnabled, setIsDomainJoiningEnabled] = useState(false);
  const [publicInviteId, setPublicInviteId] = useState(null);
  const [isInviteGenerating, setIsInviteGenerating] = useState(false);
  const [isPublicInviteLoading, setPublicInviteLoading] = useState(false);
  // Global state
  const user = useSelector(getUserAuthDetails);
  const availableTeams = useSelector(getAvailableTeams);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const { id: activeWorkspaceId } = currentlyActiveWorkspace;
  const teamId = useMemo(() => currentTeamId ?? activeWorkspaceId, [activeWorkspaceId, currentTeamId]);
  const teamDetails = availableTeams?.find((team) => team.id === teamId);
  const { isLoading, isTeamAdmin } = useIsTeamAdmin(teamId);
  const userEmailDomain = useMemo(() => getDomainFromEmail(user?.details?.profile?.email), [
    user?.details?.profile?.email,
  ]);
  const upsertTeamCommonInvite = useMemo(() => httpsCallable(getFunctions(), "invites-upsertTeamCommonInvite"), []);
  const getTeamPublicInvite = useMemo(() => httpsCallable(getFunctions(), "invites-getTeamPublicInvite"), []);

  const toggleInviteEmailModal = () => {
    setInviteErrorModalActive(!isInviteErrorModalActive);
    toggleModal();
  };

  const fetchPublicInvites = useCallback(() => {
    setPublicInviteLoading(true);
    getTeamPublicInvite({ teamId: teamId })
      .then((res) => {
        if (res?.data?.success) {
          setPublicInviteId(res?.data?.inviteId);
          setIsDomainJoiningEnabled(res?.data?.domains?.length > 0);
        }
        setPublicInviteLoading(false);
      })
      .catch((err) => {
        setPublicInviteLoading(false);
      });
  }, [teamId, getTeamPublicInvite]);

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
          toggleModal();
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

  const handleAllowDomainUsers = useCallback(
    (event) => {
      const isEnabled = event.target.checked;
      setIsDomainJoiningEnabled(isEnabled);

      upsertTeamCommonInvite({ teamId, domainEnabled: isEnabled })
        .then((res) => {
          if (!res?.data?.success) {
            setIsDomainJoiningEnabled(false);
            toast.error("Couldn't update this setting. Please contact support.");
          }
        })
        .catch(() => {
          setIsDomainJoiningEnabled(false);
          toast.error("Couldn't update this setting. Please contact support.");
        });
    },
    [teamId, upsertTeamCommonInvite]
  );

  const handleCreateInviteLink = useCallback(() => {
    setIsInviteGenerating(true);
    upsertTeamCommonInvite({ teamId: teamId, publicEnabled: true }).then((res) => {
      if (res?.data?.success) {
        setPublicInviteId(res?.data?.inviteId);
      } else {
        toast.error("Only admins can invite people");
      }
      setIsInviteGenerating(false);
    });
  }, [teamId, upsertTeamCommonInvite]);

  useEffect(() => {
    if (isOpen) trackAddMembersInWorkspaceModalViewed();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchPublicInvites();
    }
  }, [isOpen, fetchPublicInvites]);

  return (
    <>
      <RQModal width={580} centered open={isOpen} onCancel={toggleModal}>
        <div className="rq-modal-content">
          {isTeamAdmin ? (
            <>
              <div>
                <img alt="smile" width="48px" height="44px" src="/assets/img/workspaces/smiles.svg" />
              </div>
              <div className="header add-member-modal-header">
                Invite people to {currentTeamId ? `${teamDetails?.name}` : ""} workspace
              </div>
              <p className="text-gray">Get the most out of Requestly by inviting your teammates.</p>

              <div className="title mt-16">Email address</div>
              <div className="email-invites-wrapper">
                <div className="emails-input-wrapper">
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
                  <div className="access-dropdown-container">
                    <MemberRoleDropdown
                      placement="bottomRight"
                      isAdmin={makeUserAdmin}
                      handleMemberRoleChange={(isAdmin) => setMakeUserAdmin(isAdmin)}
                    />
                  </div>
                </div>
                {isTeamAdmin && (
                  <RQButton
                    size="small"
                    style={{ height: "37px", marginLeft: "4px" }}
                    type={userEmail.length ? "primary" : "default"}
                    htmlType="submit"
                    onClick={handleAddMember}
                    loading={isProcessing}
                  >
                    Invite People
                  </RQButton>
                )}
              </div>
              <div className="title mt-16">Invite link</div>
              {publicInviteId ? (
                <div className="display-flex items-center mt-8">
                  <RQInput
                    disabled
                    value={`${window.location.origin}/invite/${publicInviteId}`}
                    suffix={
                      <CopyButton type="default" copyText={`${window.location.origin}/invite/${publicInviteId}`} />
                    }
                  />
                </div>
              ) : (
                <div className="display-flex items-center">
                  <div className="text-gray mr-2">Invite someone to this workspace with a link</div>
                  <RQButton
                    loading={isInviteGenerating}
                    size="small"
                    className="create-invite-link-btn"
                    type="primary"
                    onClick={handleCreateInviteLink}
                  >
                    Create link
                  </RQButton>
                </div>
              )}
            </>
          ) : isLoading || isPublicInviteLoading ? (
            <PageLoader />
          ) : (
            <div className="title empty-message">
              <img alt="smile" width="48px" height="44px" src="/assets/img/workspaces/smiles.svg" />
              <div>Make sure you are an admin to invite teammates</div>
            </div>
          )}
        </div>
        {!isLoading && !isPublicInviteLoading && (
          <Row align="middle" className="rq-modal-footer">
            <Checkbox checked={isDomainJoiningEnabled} onChange={handleAllowDomainUsers} />{" "}
            <span className="ml-2 text-gray">
              Any verified user from <span className="text-white">{userEmailDomain}</span> can join this workspace
            </span>
          </Row>
        )}
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
