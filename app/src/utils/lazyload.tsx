import React, { lazy, Suspense, ComponentType } from "react";
import PageLoader from "components/misc/PageLoader";

type ImportFunction = () => Promise<{ default: ComponentType }>;

const lazyload = (importFunction: ImportFunction, fallback = <PageLoader />): React.FC<any> => {
  const LazyComponent = lazy(importFunction);

  const component = (props: any) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );

  return component;
};

export default lazyload;
