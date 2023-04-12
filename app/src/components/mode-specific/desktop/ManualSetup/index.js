import React from "react";
// OS Specific Components
import MacProxySettings from "./Mac";

const ManualSetup = ({ setShowInstructions }) => {
  return (
    <React.Fragment>
      <MacProxySettings setShowInstructions={setShowInstructions} />
    </React.Fragment>
  );
};

export default ManualSetup;
