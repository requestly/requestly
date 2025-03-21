import { Invite, TeamInviteMetadata } from "types";
import { getDomainFromEmail } from "utils/FormattingHelper";
import { getColorFromString } from "utils/getColorFromString";

export const getUniqueColorForUser = (userEmail: string) => {
  return getColorFromString(userEmail);
};

// email invites are given priority over domain invites
export const getUniqueTeamsFromInvites = (pendingInvites: Invite[]): TeamInviteMetadata[] => {
  if (!pendingInvites) {
    return [];
  }

  const teamsMap: Record<string, TeamInviteMetadata> = {};
  pendingInvites?.forEach((invite: any) => {
    const teamId = invite?.metadata?.teamId;
    if (!teamsMap[teamId]) {
      teamsMap[teamId] = { ...invite.metadata };
    } else if (invite.email !== null) {
      teamsMap[teamId] = { ...invite.metadata };
    }
    teamsMap[teamId].inviteId = invite.id;
  });

  return Object.values(teamsMap);
};

export const generateDefaultTeamName = (name: string, email: string) => {
  const teamName = `${name?.split(" ")[0]}'s team (${getDomainFromEmail(email)?.split(".")[0]})`;
  return teamName;
};
