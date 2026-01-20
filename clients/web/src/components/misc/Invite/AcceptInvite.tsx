import { Col, Row } from "antd";
import { RQButton } from "lib/design-system/components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "utils/Toast";
import "./index.css";
import { redirectToTeam } from "utils/RedirectionUtils";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { acceptTeamInvite } from "backend/workspace";
import { trackWorkspaceInviteAccepted } from "modules/analytics/events/features/teams";
import InviteAcceptAnimation from "../LottieAnimation/InviteAcceptAnimation";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { Workspace } from "features/workspaces/types";
import WorkspaceAvatar from "features/workspaces/components/WorkspaceAvatar";

interface Props {
  inviteId: string;
  ownerName: string;
  workspace: Workspace;
  invitedEmail?: string;
}

const AcceptInvite = ({ inviteId, ownerName, workspace }: Props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);

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
            switchWorkspace(
              {
                teamId: res?.data?.invite?.metadata?.teamId,
                teamName: res?.data?.invite?.metadata?.teamName,
                teamMembersCount: 1,
              },
              dispatch,
              {
                isSyncEnabled: user?.details?.isSyncEnabled,
                isWorkspaceMode: isSharedWorkspaceMode,
              },
              appMode,
              null,
              "invite_screen"
            );
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
            <WorkspaceAvatar workspace={workspace} size={56} />
          </div>
          <div className="header invite-header">
            {ownerName} has invited you to join workspace {workspace?.name}
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
