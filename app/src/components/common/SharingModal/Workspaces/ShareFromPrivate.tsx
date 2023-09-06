import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getAppMode, getGroupwiseRulesToPopulate, getUserAuthDetails } from "store/selectors";
import { getAvailableTeams } from "store/features/teams/selectors";
import { Avatar, Row } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { ReactMultiEmail, isEmail as validateEmail } from "react-multi-email";
import { RQButton } from "lib/design-system/components";
import puzzleImg from "assets/images/illustrations/puzzle.svg";
import { getFunctions, httpsCallable } from "firebase/functions";
import { isVerifiedBusinessDomainUser } from "utils/Misc";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { duplicateRulesToTargetWorkspace } from "../actions";
import { trackNewWorkspaceCreated } from "modules/analytics/events/common/teams";
import { trackAddTeamMemberSuccess } from "modules/analytics/events/features/teams";
import { WorkspaceSharingTypes, PostSharingData } from "../types";
import "./index.scss";
import { WorkspaceShareMenu } from "./WorkspaceShareMenu";

interface Props {
  selectedRules: string[];
  setPostShareViewData: ({ type, teamData }: PostSharingData) => void;
}

export const ShareFromPrivate: React.FC<Props> = ({ selectedRules, setPostShareViewData }) => {
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const groupwiseRules = useSelector(getGroupwiseRulesToPopulate);
  const availableTeams = useSelector(getAvailableTeams);

  console.log({ availableTeams });

  const [memberEmails, setMemberEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSharingInNewWorkspace = async () => {
    setIsLoading(true);
    const functions = getFunctions();
    const createTeam = httpsCallable(functions, "teams-createTeam");
    const createTeamInvites = httpsCallable(functions, "invites-createTeamInvites");

    const isBusinessUser = await isVerifiedBusinessDomainUser(
      user?.details?.profile?.email,
      user?.details?.profile?.uid
    );
    try {
      createTeam({
        teamName: isBusinessUser ? getDomainFromEmail(user?.details?.profile?.email) : "My Team",
      }).then((res: any) => {
        const teamId = res.data.teamId;
        const teamData = res.data;
        trackNewWorkspaceCreated();

        createTeamInvites({
          teamId,
          emails: memberEmails,
          role: "write",
        }).then((res: any) => {
          setIsLoading(false);
          if (res?.data?.success) trackAddTeamMemberSuccess(teamId, memberEmails, "write", "share_modal");
        });

        duplicateRulesToTargetWorkspace(appMode, teamId, selectedRules, groupwiseRules).then(() => {
          setIsLoading(false);
          setPostShareViewData({ type: WorkspaceSharingTypes.NEW_WORKSPACE_CREATED, teamData });
        });
      });
    } catch (e) {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Row align="middle">
        <Avatar
          size={35}
          shape="square"
          icon={<LockOutlined />}
          className="workspace-avatar"
          style={{ backgroundColor: "#1E69FF" }}
        />
        <span className="workspace-card-description">
          <div className="text-white">Private workspace</div>
          <div className="text-gray">Not shared with anyone</div>
        </span>
      </Row>
      {availableTeams.length ? (
        <>
          <div className="mt-1">Transfer rules into a workspace to start collaborating</div>
          <WorkspaceShareMenu defaultActiveWorkspaces={2} />
        </>
      ) : (
        <>{bannerToUseWorkspace}</>
      )}
      <div className="mt-8 sharing-modal-email-input-wrapper">
        <label htmlFor="user_emails" className="text-gray caption">
          Email addresses
        </label>
        <ReactMultiEmail
          className="sharing-modal-email-input"
          emails={memberEmails}
          onChange={setMemberEmails}
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
      </div>
      <RQButton
        className="mt-8 text-bold sharing-primary-btn"
        type="primary"
        onClick={handleSharingInNewWorkspace}
        loading={isLoading}
      >
        Create workspace & share
      </RQButton>
    </>
  );
};

const bannerToUseWorkspace = (
  <div className="no-available-team-hero-section">
    <img src={puzzleImg} alt="puzzle" width={48} />
    <div className="subheader mt-8">Don't just share, collaborate!</div>
    <div className="text-center text-gray" style={{ maxWidth: "340px" }}>
      Invite your friends & work together as a team share rules, recordings and more, collaborate in realtime.
    </div>
  </div>
);
