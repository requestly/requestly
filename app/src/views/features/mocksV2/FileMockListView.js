import React from "react";

import MockListIndex from "components/features/mocksV2/MockList";
import { MockType } from "components/features/mocksV2/types";

const FileMockListView = () => {
  return <MockListIndex type={MockType.FILE} />;
};

export default FileMockListView;
