import lazyload from "utils/lazyload";

export const DraftSessionViewer = lazyload(() =>
  import("./DraftSessionViewer")
);
export const SavedSessionViewer = lazyload(() =>
  import("./SavedSessionViewer")
);
