export const createResponseBodyBucketpath = (
  uid: string,
  mockId: string
): string => {
  return `users/${uid}/mocks/${mockId}/body`;
};

export const createResponseBodyFilepath = (
  uid: string,
  mockId: string,
  fileName: string
): string => {
  return createResponseBodyBucketpath(uid, mockId) + `/${fileName}`;
};
