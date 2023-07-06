import lazyload from "utils/lazyload";

export const DraftSessionViewer = lazyload(() =>
  import(/* webpackChunkName: "DraftSessionViewer" */ "./DraftSessionViewer")
);
export const SavedSessionViewer = lazyload(() =>
  import(/* webpackChunkName: "SavedSessionViewer" */ "./SavedSessionViewer")
);
