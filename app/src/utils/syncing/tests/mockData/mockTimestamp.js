// fts > lts
export const mockFirebaseTSExceedsLocalTS = {
  firebaseTimestamp: 1649100170,
  localTimestamp: 1648019881,
};

// lts>fts
export const mockLocalTSExceedsFirebaseTS = {
  firebaseTimestamp: 1648019881,
  localTimestamp: 1649100170,
};

// lts==fts
export const mockLocalTSEqualsFirebaseTS = {
  firebaseTimestamp: 1649100170,
  localTimestamp: 1649100170,
};

// !fts
export const mockNullTimestamp = {
  firebaseTimestamp: null,
  localTimestamp: null,
};

// !local timestamp
export const mockNullLocalTimestamp = {
  firebaseTimestamp: 1649100170,
  localStorage: null,
};
