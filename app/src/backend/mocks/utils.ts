export const createResponseBodyBucketpath = (uid: string, mockId: string, teamId?: string): string => {
  if (teamId) {
    return `teams/${teamId}/mocks/${mockId}/body`;
  }
  return `users/${uid}/mocks/${mockId}/body`;
};

export const createResponseBodyFilepath = (uid: string, mockId: string, fileName: string, teamId?: string): string => {
  return createResponseBodyBucketpath(uid, mockId, teamId) + `/${fileName}`;
};
