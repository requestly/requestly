import { useEffect } from "react";
import * as Sentry from "@sentry/react";
import lazyWithRetry from "utils/lazyWithRetry";
import PageLoader from "../PageLoader";

function FallbackToTrackInfiniteLoading() {
  useEffect(() => {
    const timeout_10 = setTimeout(() => {
      Sentry.captureMessage("CodeEditor lazy loaded for 10s", "fatal");
    }, 10000);

    const timeout_5 = setTimeout(() => {
      Sentry.captureMessage("CodeEditor lazy loaded for 5s", "fatal");
    }, 5000);
    return () => {
      clearTimeout(timeout_10);
      clearTimeout(timeout_5);
    };
  }, []);
  return <PageLoader />;
}

export default lazyWithRetry(
  () => import(/* webpackChunkName: "CodeEditor" */ "./CodeEditor"),
  <FallbackToTrackInfiniteLoading />
);

// export { default } from "./CodeEditor";
