export const getOwnerId = (uid: string, teamId?: string) => {
  if (teamId) {
    return `team-${teamId}`;
  }
  return uid;
};
