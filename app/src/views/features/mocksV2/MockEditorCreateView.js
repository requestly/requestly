import React from "react";

import MockEditorIndex from "components/features/mocksV2/MockEditor";
import ProtectedRoute from "components/authentication/ProtectedRoute";
import { MockType } from "components/features/mocksV2/types";

const MockEditorCreateView = () => {
  return (
    <>
      <ProtectedRoute
        component={MockEditorIndex}
        isNew={true}
        mockType={MockType.API}
      />
    </>
  );
};

export default MockEditorCreateView;
