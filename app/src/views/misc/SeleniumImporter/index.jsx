import React, { Suspense } from "react";
const SeleniumImporter = React.lazy(() => import("./SeleniumImporterPage"));

const SeleniumImporterWrapper = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <SeleniumImporter />
  </Suspense>
);

export default SeleniumImporterWrapper;
