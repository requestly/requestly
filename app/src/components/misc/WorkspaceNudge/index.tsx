import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { Typography, Row } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { RQButton } from "lib/design-system/components";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { actions } from "store";
import { Invite, TeamInvite } from "types";
import "./index.css";
import JoinWorkspaceModal from "components/user/AccountIndexPage/ManageAccount/ManageTeams/JoinWorkspaceModal";

export const WorkspaceNudge: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [hasActiveWorkspace, setHasActiveWorkspace] = useState<boolean>(false);
  const [teamInvites, setTeamInvites] = useState<TeamInvite[]>(null);
  const [isJoinWorkspaceModalVisible, setIsJoinWorkspaceModalVisible] = useState<boolean>(false);
  const userEmailDomain = useMemo(() => getDomainFromEmail(user?.details?.profile?.email)?.split(".")[0], [
    user?.details?.profile?.email,
  ]);

  const getPendingInvites = useMemo(
    () =>
      httpsCallable<{ email: boolean; domain: boolean }, { pendingInvites: TeamInvite[]; success: boolean }>(
        getFunctions(),
        "teams-getPendingTeamInvites"
      ),
    []
  );

  const handleNudgeCTAClick = () => {
    if (hasActiveWorkspace) {
      setIsJoinWorkspaceModalVisible(true);
    } else {
      dispatch(
        actions.toggleActiveModal({
          modalName: "createWorkspaceModal",
          newValue: true,
          newProps: { defaultWorkspaceName: `${userEmailDomain} <team name>` },
        })
      );
    }
  };

  useEffect(() => {
    if (user?.loggedIn) {
      getPendingInvites({ email: true, domain: true })
        .then((res) => {
          if (res?.data?.pendingInvites) {
            const hasActive = res.data.pendingInvites.some(
              (invite: Invite) => (invite.metadata.teamAccessCount as number) > 1
            );
            if (hasActive) {
              setHasActiveWorkspace(true);
              setTeamInvites(res?.data?.pendingInvites);
            }
          }
        })
        .catch((e) => {
          setHasActiveWorkspace(false);
        });
    }
  }, [dispatch, getPendingInvites, user?.loggedIn]);

  return (
    <>
      <div className="nudge-container">
        <Row justify="end">
          <RQButton type="default" className="nudge-close-icon" iconOnly icon={<CloseOutlined />} />
        </Row>
        <div>IMAGES HERE</div>
        <Typography.Text className="display-block nudge-text">
          {hasActiveWorkspace
            ? "22 users from Amazon are collaborating on a team workspace"
            : "22 users from Amazon are using Requestly."}
        </Typography.Text>
        <RQButton type="primary" className="mt-8 text-bold" onClick={handleNudgeCTAClick}>
          {hasActiveWorkspace ? "Join your teammates" : "Start collaborating"}
        </RQButton>
      </div>
      {isJoinWorkspaceModalVisible && (
        <JoinWorkspaceModal
          isOpen={isJoinWorkspaceModalVisible}
          teamInvites={teamInvites}
          handleModalClose={() => setIsJoinWorkspaceModalVisible(false)}
          allowCreateNewWorkspace={false}
        />
      )}
    </>
  );
};
