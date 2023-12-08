import React from "react";
import { useSelector } from "react-redux";
import { getAppOnboardingDetails } from "store/selectors";
import { DefaultTeamView } from "./components/defaultTeamView";
import { JoinTeamView } from "./components/joinTeamsView";
import { Invite } from "types";

interface WorkspaceOnboardingViewProps {
  pendingInvites: Invite[];
}

export const WorkspaceOnboardingView: React.FC<WorkspaceOnboardingViewProps> = ({ pendingInvites }) => {
  const appOnboardingDetails = useSelector(getAppOnboardingDetails);
  if (pendingInvites.length) return <JoinTeamView pendngInvites={pendingInvites} />;
  if (appOnboardingDetails.createdWorkspace) return <DefaultTeamView />;
};
