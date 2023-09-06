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
import "./index.scss";

interface Props {
  selectedRules: string[];
}

export const ShareFromPrivate: React.FC<Props> = ({ selectedRules }) => {
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const groupwiseRules = useSelector(getGroupwiseRulesToPopulate);
  const availableTeams = useSelector(getAvailableTeams);

  const [memberEmails, setMemberEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSharingInNewWorkspace = async () => {
    setIsLoading(true);
    const functions = getFunctions();
    const createTeam = httpsCallable(functions, "teams-createTeam");
    const createTeamInvites = httpsCallable(functions, "invites-createTeamInvites");

    const isVerifiedUser = await isVerifiedBusinessDomainUser(
      user?.details?.profile?.email,
      user?.details?.profile?.uid
    );
    try {
      createTeam({
        teamName: isVerifiedUser ? getDomainFromEmail(user?.details?.profile?.email) : "My Team",
      }).then((res: any) => {
        const teamId = res.data.teamId;
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
        });
      });
    } catch (e) {
      setIsLoading(false);
      console.log(e);
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
        <span className="private-workspace-card-description">
          <div className="text-white">Private workspace</div>
          <div className="text-gray">Not shared with anyone</div>
        </span>
      </Row>
      {availableTeams.length ? <></> : <>{collaborateCTA}</>}
      <div className="mt-8 sharing-modal-email-input-wrapper">
        <label htmlFor="user_emails" className="text-gray caption">
          Email addresses
        </label>
        <ReactMultiEmail
          className="sharing-modal-email-input"
          //@ts-ignore
          type="email"
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

const collaborateCTA = (
  <div className="no-available-team-hero-section">
    <img src={puzzleImg} alt="puzzle" width={48} />
    <div className="subheader mt-8">Don't just share, collaborate!</div>
    <div className="text-center text-gray" style={{ maxWidth: "340px" }}>
      Invite your friends & work together as a team share rules, recordings and more, collaborate in realtime.
    </div>
  </div>
);
