import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Col, Row, Input, Divider } from "antd";
import { getCurrentlyActiveWorkspaceMembers } from "store/features/teams/selectors";
//Firebase
import { getFunctions, httpsCallable } from "firebase/functions";

import { RQButton } from "lib/design-system/components";
import CopyButton from "components/misc/CopyButton";
import { toast } from "utils/Toast";
import { getUserAuthDetails } from "store/selectors";
// import LearnMoreAboutWorkspace from "../../common/LearnMoreAboutWorkspace";
import "./index.css";
import {
  trackWorkspaceInviteLinkGenerated,
  trackWorkspaceInviteLinkRevoked,
} from "modules/analytics/events/features/teams";

interface Props {
  teamId: string;
}

const PublicInviteLink: React.FC<Props> = ({ teamId }) => {
  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [publicInviteId, setPublicInviteId] = useState(null);
  const [publicInviteLoading, setPublicInviteLoading] = useState(false);

  // Global state
  const currentTeamMembers = useSelector(getCurrentlyActiveWorkspaceMembers);
  const user = useSelector(getUserAuthDetails);
  const isCurrentUserAdmin = currentTeamMembers[user?.details?.profile?.uid]?.isAdmin === true;

  const handlePublicInviteCreateClicked = () => {
    trackWorkspaceInviteLinkGenerated(teamId);
    setIsLoading(true);
    const functions = getFunctions();
    const createTeamInvite = httpsCallable(functions, "invites-createTeamInvite");
    createTeamInvite({ teamId: teamId, usage: "unlimited" }).then((res: any) => {
      if (res?.data?.success) {
        setPublicInviteId(res?.data?.inviteId);
      } else {
        toast.error("Only admins can invite people");
      }
      setIsLoading(false);
    });
  };

  const handlePublicInviteRevokeClicked = () => {
    trackWorkspaceInviteLinkRevoked(teamId);
    setIsLoading(true);
    const functions = getFunctions();
    const revokeInvite = httpsCallable(functions, "invites-revokeInvite");
    revokeInvite({ inviteId: publicInviteId }).then((res: any) => {
      if (res?.data?.success) {
        setPublicInviteId(null);
        toast.success("Successfully Revoked invite");
      } else {
        toast.error("Only admins can revoke invites");
      }
      setIsLoading(false);
    });
  };

  const generateInviteLinkFromId = (inviteId: any) => {
    return `${window.location.origin}/invite/${inviteId}`;
  };

  const fetchPublicInviteLink = () => {
    setPublicInviteLoading(true);
    const functions = getFunctions();
    const getTeamPublicInvite = httpsCallable(functions, "invites-getTeamPublicInvite");
    getTeamPublicInvite({ teamId: teamId })
      .then((res: any) => {
        if (res?.data?.success) {
          setPublicInviteId(res?.data?.inviteId);
        }
        setPublicInviteLoading(false);
      })
      .catch((err) => {
        setPublicInviteLoading(false);
      });
  };

  const stableFetchPublicInviteLink = useCallback(fetchPublicInviteLink, [teamId]);

  useEffect(() => {
    stableFetchPublicInviteLink();
  }, [stableFetchPublicInviteLink]);

  if (!isCurrentUserAdmin) {
    return null;
  }

  return (
    <>
      {publicInviteLoading ? null : (
        <Row>
          <Col span={24}>
            {/* <LearnMoreAboutWorkspace
              linkText="Learn about adding members to your
              workspace"
            /> */}

            <Row align="middle" justify="space-between">
              <Col className="title">Public Invite link</Col>
              <Col className="ml-auto">
                {publicInviteId ? (
                  <RQButton loading={isLoading} danger type="primary" onClick={handlePublicInviteRevokeClicked}>
                    {isLoading ? "Revoking" : "Revoke"}
                  </RQButton>
                ) : (
                  <RQButton loading={isLoading} onClick={handlePublicInviteCreateClicked} type="primary">
                    {isLoading ? "Creating" : "Create Link"}
                  </RQButton>
                )}
              </Col>
            </Row>

            <p className="text-dark-gray invite-link-info-message">
              Share this secret link to invite people to this workspace. Only users who can invite members can see this.
            </p>
          </Col>
        </Row>
      )}

      {publicInviteId ? (
        <Row justify="space-between">
          <Col flex="1 0 auto" className="invite-link-input-container">
            <Input
              className="invite-link-input"
              contentEditable={false}
              value={generateInviteLinkFromId(publicInviteId)}
              disabled={true}
              type="text"
            />
          </Col>
          <Col flex="0 0 auto">
            <CopyButton size="middle" type="primary" title="Copy" copyText={generateInviteLinkFromId(publicInviteId)} />
          </Col>
        </Row>
      ) : null}
      <Divider className="manage-workspace-divider" />
    </>
  );
};

export default PublicInviteLink;
