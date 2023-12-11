import { useEffect } from "react";
import * as Sentry from "@sentry/react";
import lazyWithRetry from "utils/lazyWithRetry";
import PageLoader from "../PageLoader";

function FallbackToTrackInfiniteLoading() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      Sentry.captureMessage("CodeEditor lazy loaded for too long", "fatal");
    }, 3500);
    return () => {
      clearTimeout(timeout);
    };
  }, []);
  return <PageLoader />;
}

export default lazyWithRetry(
  () => import(/* webpackChunkName: "CodeEditor" */ "./CodeEditor"),
  <FallbackToTrackInfiniteLoading />
);

// export { default } from "./CodeEditor";
