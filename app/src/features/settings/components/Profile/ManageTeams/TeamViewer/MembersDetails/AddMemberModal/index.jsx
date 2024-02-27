import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useIsTeamAdmin } from "../../hooks/useIsTeamAdmin";
import { toast } from "utils/Toast.js";
import { Row, Col, Checkbox, Typography } from "antd";
import { getAvailableTeams, getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { getUserAuthDetails } from "store/selectors";
import isEmail from "validator/lib/isEmail";
import { getFunctions, httpsCallable } from "firebase/functions";
import { RQButton, RQInput, RQModal } from "lib/design-system/components";
import MemberRoleDropdown from "../../common/MemberRoleDropdown";
import CopyButton from "components/misc/CopyButton";
import { LearnMoreLink } from "components/common/LearnMoreLink";
import { trackAddTeamMemberFailure, trackAddTeamMemberSuccess } from "modules/analytics/events/features/teams";
import { trackAddMembersInWorkspaceModalViewed } from "modules/analytics/events/common/teams";
import InviteErrorModal from "./InviteErrorModal";
import PageLoader from "components/misc/PageLoader";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { isVerifiedBusinessDomainUser } from "utils/Misc";
import APP_CONSTANTS from "config/constants";
import EmailInputWithDomainBasedSuggestions from "components/common/EmailInputWithDomainBasedSuggestions";
import "./AddMemberModal.css";
import { fetchBillingIdByOwner, toggleWorkspaceMappingInBillingTeam } from "backend/billing";

const AddMemberModal = ({ isOpen, toggleModal, callback, teamId: currentTeamId, source }) => {
  //Component State
  const [userEmail, setUserEmail] = useState([]);
  const [makeUserAdmin, setMakeUserAdmin] = useState(false);
  const [isInviteErrorModalActive, setInviteErrorModalActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inviteErrors, setInviteErrors] = useState([]);
  const [isDomainJoiningEnabled, setIsDomainJoiningEnabled] = useState(false);
  const [publicInviteId, setPublicInviteId] = useState(null);
  const [isInvitePublic, setIsInvitePublic] = useState(false);
  const [isInviteGenerating, setIsInviteGenerating] = useState(false);
  const [isPublicInviteLoading, setPublicInviteLoading] = useState(false);
  const [isVerifiedBusinessUser, setIsVerifiedBusinessUser] = useState(false);
  const [isAddToBillingViewVisible, setIsAddToBillingViewVisible] = useState(false);
  const [billingId, setBillingId] = useState(null);
  const [isBillingTeamMapped, setIsBillingTeamMapped] = useState(false);

  // Global state
  const user = useSelector(getUserAuthDetails);
  const isAppSumoDeal = user?.details?.planDetails?.type === "appsumo";

  const availableTeams = useSelector(getAvailableTeams);
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  const { id: activeWorkspaceId } = currentlyActiveWorkspace;
  const teamId = useMemo(() => currentTeamId ?? activeWorkspaceId, [activeWorkspaceId, currentTeamId]);
  const { isLoading, isTeamAdmin } = useIsTeamAdmin(teamId);

  const teamDetails = useMemo(() => availableTeams?.find((team) => team.id === teamId), [availableTeams, teamId]);
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
          setIsInvitePublic(res?.data?.public);
          setIsDomainJoiningEnabled(res?.data?.domains?.length > 0);
        }
        setPublicInviteLoading(false);
      })
      .catch((err) => {
        setPublicInviteLoading(false);
      });
  }, [teamId, getTeamPublicInvite]);

  const handleAddToBilling = async () => {
    setIsProcessing(true);
    await toggleWorkspaceMappingInBillingTeam(billingId, teamDetails?.id, true);
    handleAddMember();
  };

  const handleAddMember = useCallback(() => {
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

    if (
      !isAddToBillingViewVisible &&
      !isBillingTeamMapped &&
      isTeamAdmin &&
      ["active", "trialing", "past_due"].includes(teamDetails?.subscriptionStatus) &&
      !isAppSumoDeal
    ) {
      setIsAddToBillingViewVisible(true);
      return;
    }

    const functions = getFunctions();
    const createTeamInvites = httpsCallable(functions, "invites-createTeamInvites");
    setIsProcessing(true);

    createTeamInvites({
      teamId: teamId,
      emails: userEmail,
      role: makeUserAdmin ? "admin" : "write",
      teamName: teamDetails?.name,
      numberOfMembers: teamDetails?.accessCount,
      source: "add_member_modal",
    })
      .then((res) => {
        if (res?.data?.success) {
          toast.success("Sent invites successfully");
          callback?.();
          trackAddTeamMemberSuccess({
            team_id: teamId,
            emails: userEmail,
            is_admin: makeUserAdmin,
            source: "add_member_modal",
            num_users_added: userEmail.length,
          });
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
  }, [
    userEmail,
    teamId,
    makeUserAdmin,
    teamDetails,
    callback,
    toggleModal,
    isAddToBillingViewVisible,
    isTeamAdmin,
    isBillingTeamMapped,
    isAppSumoDeal,
  ]);

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
        setIsInvitePublic(true);
      } else {
        toast.error("Only admins can invite people");
      }
      setIsInviteGenerating(false);
    });
  }, [teamId, upsertTeamCommonInvite]);

  useEffect(() => {
    isVerifiedBusinessDomainUser(user?.details?.profile?.email, user?.details?.profile?.uid).then((isVerified) =>
      setIsVerifiedBusinessUser(isVerified)
    );
  }, [user?.details?.profile?.email, user?.details?.profile?.uid]);

  useEffect(() => {
    if (isOpen) trackAddMembersInWorkspaceModalViewed(source);
  }, [isOpen, source]);

  useEffect(() => {
    if (isOpen) {
      fetchPublicInvites();
    }
  }, [isOpen, fetchPublicInvites]);

  useEffect(() => {
    fetchBillingIdByOwner(teamDetails?.owner, user?.details?.profile?.uid).then(({ billingId, mappedWorkspaces }) => {
      setBillingId(billingId);
      setIsBillingTeamMapped(mappedWorkspaces?.includes(teamDetails?.id));
    });
  }, [teamDetails?.id, teamDetails?.owner, user?.details?.profile?.uid]);

  if (!activeWorkspaceId) return null;

  return (
    <>
      <RQModal width={620} centered open={isOpen} onCancel={toggleModal} className="add-member-modal">
        {isPublicInviteLoading || isLoading ? (
          <div style={{ height: "300px" }}>
            <PageLoader />
          </div>
        ) : (
          <>
            <div className="rq-modal-content">
              {isAddToBillingViewVisible ? (
                <>
                  <Typography.Title level={5}>
                    Would you like to activate premium features for the new members being added to this workspace?
                  </Typography.Title>
                  <Row className="mt-20" gutter={8} align="middle">
                    <Col>
                      <RQButton type="primary" onClick={handleAddToBilling} disabled={isProcessing}>
                        Yes
                      </RQButton>
                    </Col>
                    <Col>
                      <RQButton type="default" onClick={handleAddMember} disabled={isProcessing}>
                        No
                      </RQButton>
                    </Col>
                  </Row>
                </>
              ) : (
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
                      <EmailInputWithDomainBasedSuggestions onChange={setUserEmail} transparentBackground={true} />
                      {isTeamAdmin && (
                        <div className="access-dropdown-container">
                          <MemberRoleDropdown
                            placement="bottomRight"
                            isAdmin={makeUserAdmin}
                            handleMemberRoleChange={(isAdmin) => setMakeUserAdmin(isAdmin)}
                          />
                        </div>
                      )}
                    </div>

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
                  </div>

                  {isTeamAdmin && (
                    <>
                      {isInvitePublic ? (
                        <>
                          <div className="title mt-16">Invite link</div>{" "}
                          <div className="display-flex items-center mt-8">
                            <RQInput
                              disabled
                              value={`${window.location.origin}/invite/${publicInviteId}`}
                              suffix={
                                <CopyButton
                                  type="default"
                                  copyText={`${window.location.origin}/invite/${publicInviteId}`}
                                />
                              }
                            />
                          </div>
                        </>
                      ) : (
                        <div className="display-flex items-center mt-16">
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
                  )}
                </>
              )}
            </div>
            {!isAddToBillingViewVisible && (
              <Row align="middle" className="rq-modal-footer">
                {isVerifiedBusinessUser ? (
                  <>
                    {!isPublicInviteLoading && (
                      <>
                        <Checkbox checked={isDomainJoiningEnabled} onChange={handleAllowDomainUsers} />{" "}
                        <span className="ml-2 text-gray">
                          Any verified user from <span className="text-white">{userEmailDomain}</span> can join this
                          workspace
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <LearnMoreLink
                    linkText="Learn more about team workspaces"
                    href={APP_CONSTANTS.LINKS.DEMO_VIDEOS.TEAM_WORKSPACES}
                  />
                )}
              </Row>
            )}
          </>
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
