export const createMockDataPath = (uid: string, mockId: string, teamId?: string): string => {
  if (teamId) {
    return `teams/${teamId}/mocks/${mockId}`;
  }
  return `users/${uid}/mocks/${mockId}`;
};

export const createResponseBodyBucketpath = (uid: string, mockId: string, teamId?: string): string => {
  return createMockDataPath(uid, mockId, teamId) + "/body";
};

export const createResponseBodyFilepath = (uid: string, mockId: string, fileName: string, teamId?: string): string => {
  return createResponseBodyBucketpath(uid, mockId, teamId) + `/${fileName}`;
};

export const createMockLogsBucketPath = (uid: string, mockId: string, teamId?: string): string => {
  return createMockDataPath(uid, mockId, teamId) + "/logs";
};

export const createMockLogFilePath = (uid: string, mockId: string, logId: string, teamId?: string): string => {
  return createMockLogsBucketPath(uid, mockId, teamId) + `/${logId}`;
};
