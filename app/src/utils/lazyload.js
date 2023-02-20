import React, { lazy, Suspense } from "react";
import PageLoader from "components/misc/PageLoader";

const lazyload = (importFunction, fallback = <PageLoader />) => {
  const LazyComponent = lazy(importFunction);

  const component = (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
  component.displayName = "loadable";
  return component;
};

export default lazyload;
