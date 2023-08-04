import React, { ComponentType } from "react";
import PageLoader from "components/misc/PageLoader";
import lazyload from "./lazyload";

type ImportFunction = () => Promise<{ default: ComponentType }>;

// Use this only for route based lazy imports
const lazyWithRetry = (importFunction: ImportFunction, fallback = <PageLoader />): React.FC<any> => {
  const LazyComponent = lazyload(async () => {
    // check if the window has already been refreshed
    const hasRefreshed = JSON.parse(window.sessionStorage.getItem("retry-lazy-refreshed") || "false");
    // try to import the component
    try {
      const componentImport = await importFunction();
      window.sessionStorage.setItem("retry-lazy-refreshed", "false"); // success so reset the refresh
      return componentImport;
    } catch (error) {
      console.log(error.name);
      if (!hasRefreshed) {
        // not been refreshed yet
        window.sessionStorage.setItem("retry-lazy-refreshed", "true"); // we are now going to refresh
        window.location.reload();
        // Capture this in sentry
        return { default: null };
      }
      return error; // Default error behaviour as already tried refresh
    }
  }, fallback);

  return LazyComponent;
};

export default lazyWithRetry;
