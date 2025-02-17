import { Avatar, Col, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUniqueColorForWorkspace } from "features/workspaces/components/WorkspaceAvatar";
import { toast } from "utils/Toast";
import "./index.css";
import { redirectToTeam } from "utils/RedirectionUtils";
import { acceptTeamInvite } from "backend/workspace";
import { trackWorkspaceInviteAccepted } from "modules/analytics/events/features/teams";
import InviteAcceptAnimation from "../LottieAnimation/InviteAcceptAnimation";
import { useWorkspaceHelpers } from "features/workspaces/hooks/useWorkspaceHelpers";

interface Props {
  inviteId: string;
  ownerName: string;
  workspaceId: string;
  workspaceName: string;
  invitedEmail?: string;
}

const AcceptInvite = ({ inviteId, ownerName, workspaceId, workspaceName }: Props) => {
  const navigate = useNavigate();
  const { switchWorkspace } = useWorkspaceHelpers();

  const [inProgress, setInProgress] = useState(false);

  const handleAcceptInvitation = () => {
    setInProgress(true);
    acceptTeamInvite(inviteId)
      .then((res) => {
        if (res?.success) {
          toast.success("Successfully accepted invite");
          trackWorkspaceInviteAccepted(
            res?.data?.invite?.metadata?.teamId,
            res?.data?.invite?.metadata?.teamName,
            inviteId,
            "invite_screen",
            res?.data?.invite?.usage,
            res?.data?.invite?.metadata?.teamAccessCount
          );

          if (res?.data?.invite.type === "teams") {
            switchWorkspace(res?.data?.invite?.metadata?.teamId as string, "invite_screen");
            redirectToTeam(navigate, res?.data?.invite?.metadata?.teamId, {
              state: {
                isNewTeam: false,
              },
            });
          }
        }
        setInProgress(false);
      })
      .catch((err) => {
        toast.error("Error while accepting invitation. Please contact workspace admin");
        setInProgress(false);
      });
  };

  return (
    <Row className="invite-container" justify={"center"}>
      <Col xs={18} sm={16} md={14} lg={12} xl={8}>
        <div className="invite-content">
          <RQButton className="invite-skip-button" type="text" size="middle" onClick={() => navigate("/")}>
            No, I'll skip
          </RQButton>
          <div className="workspace-image invite-accept-avatar-image">
            <Avatar
              size={56}
              shape="square"
              icon={workspaceName ? workspaceName?.[0]?.toUpperCase() : "P"}
              style={{
                backgroundColor: `${getUniqueColorForWorkspace(workspaceId ?? "", workspaceName)}`,
              }}
            />
          </div>
          <div className="header invite-header">
            {ownerName} has invited you to join workspace {workspaceName}
          </div>
          <p className="text-gray invite-subheader">Accept to start collaborating together</p>

          <div className="invite-accept-lottie-animation-container">
            <InviteAcceptAnimation className="invite-accept-lottie-animation" animationName="invite-accept" />
          </div>
        </div>
        <div className="invite-footer">
          {inProgress ? (
            <RQButton loading={true} className="invite-button" type="primary" size="middle">
              Accepting Invitation
            </RQButton>
          ) : (
            <RQButton className="invite-button" type="primary" size="middle" onClick={handleAcceptInvitation}>
              Accept Invitation
            </RQButton>
          )}
        </div>
      </Col>
    </Row>
  );
};

export default AcceptInvite;
