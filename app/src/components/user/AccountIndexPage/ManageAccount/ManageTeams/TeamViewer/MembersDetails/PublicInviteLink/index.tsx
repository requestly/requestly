import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { Col, Row, Input, Divider, Typography, Switch, Space } from "antd";
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
import { trackWorkspaceInviteLinkCopied } from "modules/analytics/events/common/teams";
import { getDomainFromEmail, isCompanyEmail } from "utils/FormattingHelper";

interface Props {
  teamId: string;
}

const PublicInviteLink: React.FC<Props> = ({ teamId }) => {
  const functions = getFunctions();
  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [publicInviteId, setPublicInviteId] = useState(null);
  const [publicInviteLoading, setPublicInviteLoading] = useState(false);
  const [isInvitePublic, setIsInvitePublic] = useState(false);
  const [domainJoiningEnabled, setDomainJoiningEnabled] = useState(false);

  // Global state
  const currentTeamMembers = useSelector(getCurrentlyActiveWorkspaceMembers);
  const user = useSelector(getUserAuthDetails);
  const isCurrentUserAdmin = currentTeamMembers[user?.details?.profile?.uid]?.isAdmin === true;

  const upsertTeamCommonInvite = httpsCallable(functions, "invites-upsertTeamCommonInvite");

  const userEmailDomain = useMemo(() => getDomainFromEmail(user?.details?.profile?.email), [
    user?.details?.profile?.email,
  ]);

  const isBusinessEmail = useMemo(() => isCompanyEmail(user?.details?.profile?.email), [user?.details?.profile?.email]);

  const handlePublicInviteCreateClicked = useCallback(() => {
    trackWorkspaceInviteLinkGenerated(teamId);
    setIsLoading(true);
    upsertTeamCommonInvite({ teamId: teamId, publicEnabled: true }).then((res: any) => {
      if (res?.data?.success) {
        setIsInvitePublic(true);
        setPublicInviteId(res?.data?.inviteId);
      } else {
        toast.error("Only admins can invite people");
      }
      setIsLoading(false);
    });
  }, [teamId, upsertTeamCommonInvite]);

  const handlePublicInviteRevokeClicked = useCallback(() => {
    trackWorkspaceInviteLinkRevoked(teamId);
    setIsLoading(true);
    upsertTeamCommonInvite({ teamId, publicEnabled: false }).then((res: any) => {
      if (res?.data?.success) {
        setIsInvitePublic(false);
        toast.success("Successfully Revoked invite");
      } else {
        toast.error("Only admins can revoke invites");
      }
      setIsLoading(false);
    });
  }, [teamId, upsertTeamCommonInvite]);

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
          setIsInvitePublic(res?.data?.public);
          setDomainJoiningEnabled(res?.data?.domains?.length > 0);
        }
        setPublicInviteLoading(false);
      })
      .catch((err) => {
        setPublicInviteLoading(false);
      });
  };

  const stableFetchPublicInviteLink = useCallback(fetchPublicInviteLink, [teamId]);

  const handleDomainToggle = useCallback(
    (enabled: boolean) => {
      setDomainJoiningEnabled(enabled);
      upsertTeamCommonInvite({ teamId, domainEnabled: enabled })
        .then((res: any) => {
          if (!res?.data?.success) {
            setDomainJoiningEnabled(!enabled);
            toast.error("Couldn't update this setting. Please contact support.");
          }
        })
        .catch(() => {
          setDomainJoiningEnabled(!enabled);
          toast.error("Couldn't update this setting. Please contact support.");
        });
    },
    [teamId, upsertTeamCommonInvite]
  );

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
                {isInvitePublic ? (
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

      {isInvitePublic ? (
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
            <CopyButton
              size="middle"
              type="primary"
              title="Copy"
              copyText={generateInviteLinkFromId(publicInviteId)}
              trackCopiedEvent={() => trackWorkspaceInviteLinkCopied("workspace_settings")}
            />
          </Col>
        </Row>
      ) : null}

      {isBusinessEmail ? (
        <Space className="mt-8">
          <Typography.Text type="secondary">{`Anyone with ${userEmailDomain} can join this workspace`}</Typography.Text>
          <Switch checked={domainJoiningEnabled} size="small" onChange={handleDomainToggle} />
        </Space>
      ) : null}

      <Divider className="manage-workspace-divider" />
    </>
  );
};

export default PublicInviteLink;
