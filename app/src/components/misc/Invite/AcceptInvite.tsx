import { Avatar, Col, Row } from "antd";
import { getFunctions, httpsCallable } from "firebase/functions";
import { RQButton } from "lib/design-system/components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUniqueColorForWorkspace } from "utils/teams";
import { toast } from "utils/Toast";
import "./index.css";
import { redirectToTeam } from "utils/RedirectionUtils";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { getIsWorkspaceMode } from "store/features/teams/selectors";
import { trackWorkspaceInviteAccepted } from "modules/analytics/events/features/teams";
import InviteAcceptAnimation from "../LottieAnimation/InviteAcceptAnimation";

interface Props {
  inviteId: string;
  ownerName: string;
  workspaceId: string;
  workspaceName: string;
  invitedEmail?: string;
}

const AcceptInvite = ({ inviteId, ownerName, workspaceId, workspaceName }: Props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isWorkspaceMode = useSelector(getIsWorkspaceMode);

  const [inProgress, setInProgress] = useState(false);

  const handleAcceptInvitation = () => {
    const functions = getFunctions();
    const acceptInvite = httpsCallable(functions, "invites-acceptInvite");

    setInProgress(true);
    acceptInvite({ inviteId })
      .then((res: any) => {
        if (res?.data?.success) {
          toast.success("Successfully accepted invite");
          trackWorkspaceInviteAccepted(
            res?.data?.data?.invite?.metadata?.teamId,
            inviteId,
            "invite_screen",
            res?.data?.data?.invite?.usage,
            res?.data?.data?.invite?.metadata?.teamAccessCount
          );

          if (res?.data?.data?.invite.type === "teams") {
            switchWorkspace(
              {
                teamId: res?.data?.data?.invite?.metadata?.teamId,
                teamName: res?.data?.data?.invite?.metadata?.teamName,
                teamMembersCount: 1,
              },
              dispatch,
              {
                isSyncEnabled: user?.details?.isSyncEnabled,
                isWorkspaceMode,
              },
              appMode
            );
            redirectToTeam(navigate, res?.data?.data?.invite?.metadata?.teamId, {
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
