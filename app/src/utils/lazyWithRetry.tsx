import React, { ComponentType } from "react";
import PageLoader from "components/misc/PageLoader";
import lazyload from "./lazyload";

type ImportFunction = () => Promise<{ default: ComponentType }>;

// Use this only for route based lazy imports
const lazyWithRetry = (importFunction: ImportFunction, fallback = <PageLoader />): React.FC<any> => {
  const LazyComponent = lazyload(() => {
    return new Promise((resolve, reject) => {
      // check if the window has already been refreshed
      const hasRefreshed = JSON.parse(window.sessionStorage.getItem("retry-lazy-refreshed") || "false");
      // try to import the component
      importFunction()
        .then((component) => {
          window.sessionStorage.setItem("retry-lazy-refreshed", "false"); // success so reset the refresh
          resolve(component);
        })
        .catch((error) => {
          if (!hasRefreshed) {
            // not been refreshed yet
            window.sessionStorage.setItem("retry-lazy-refreshed", "true"); // we are now going to refresh
            return window.location.reload(); // refresh the page
          }
          reject(error); // Default error behaviour as already tried refresh
        });
    });
  }, fallback);

  return LazyComponent;
};

export default lazyWithRetry;
