import { useEffect } from "react";
import * as Sentry from "@sentry/react";
import lazyWithRetry from "utils/lazyWithRetry";
import PageLoader from "../PageLoader";

function FallbackToTrackInfiniteLoading() {
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    if (window.localStorage.getItem("hard-refresh-against-infinite-loading")) {
      window.localStorage.removeItem("hard-refresh-against-infinite-loading");
      timeout = setTimeout(() => {
        Sentry.captureMessage("CodeEditor stuck on loading even after hard refresh", "fatal");
      }, 3500);
    } else {
      timeout = setTimeout(() => {
        window.localStorage.setItem("hard-refresh-against-infinite-loading", "true");
        Sentry.captureMessage("CodeEditor lazy loaded for too long", "warning");
        window.location.reload();
      }, 3500);
    }
    return () => {
      timeout ?? clearTimeout(timeout);
    };
  }, []);
  return <PageLoader />;
}

export default lazyWithRetry(
  () => import(/* webpackChunkName: "CodeEditor" */ "./CodeEditor"),
  <FallbackToTrackInfiniteLoading />
);

// export { default } from "./CodeEditor";
