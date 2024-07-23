export const getOwnerId = (uid: string, teamId?: string) => {
  if (teamId) {
    return `team-${teamId}`;
  }
  return uid;
};

export const isTeamOwner = (ownerId: string) => {
  return ownerId.startsWith("team-");
};

export const getTeamFromOwnerId = (ownerId: string) => {
  if (isTeamOwner(ownerId)) {
    return ownerId.split("-")[1];
  } else return null;
};
