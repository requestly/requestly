import { Invite, TeamInviteMetadata } from "types";
import { getColorFromString } from "utils/getColorFromString";

export const getUniqueColorForWorkspace = (teamId: string, teamName: string) => {
  return getColorFromString(teamId + teamName);
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
