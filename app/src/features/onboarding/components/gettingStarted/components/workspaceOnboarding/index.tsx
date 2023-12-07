import React from "react";
import { useSelector } from "react-redux";
import { getAppOnboardingDetails } from "store/selectors";
import { DefaultTeamView } from "./components/defaultTeamView";
import { Invite } from "types";

interface WorkspaceOnboardingViewProps {
  pendingInvites: Invite[];
}

export const WorkspaceOnboardingView: React.FC<WorkspaceOnboardingViewProps> = ({ pendingInvites }) => {
  const appOnboardingDetails = useSelector(getAppOnboardingDetails);
  if (pendingInvites.length) return <>PENDING INVITES</>;
  if (appOnboardingDetails.createdWorkspace) return <DefaultTeamView />;
};
