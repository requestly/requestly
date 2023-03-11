import React from "react";
import MockListIndex from "components/features/mocksV2/MockList";
import { MockType } from "components/features/mocksV2/types";

const MockListView = () => {
  return <MockListIndex type={MockType.API} />;
};

export default MockListView;
