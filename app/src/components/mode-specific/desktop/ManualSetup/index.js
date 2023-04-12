import ProCard from "@ant-design/pro-card";
import React from "react";
// OS Specific Components
import MacProxySettings from "./Mac";

const ManualSetup = ({ setShowInstructions }) => {
  return (
    <React.Fragment>
      <ProCard className="primary-card github-like-border">
        <MacProxySettings setShowInstructions={setShowInstructions} />
      </ProCard>
    </React.Fragment>
  );
};

export default ManualSetup;
