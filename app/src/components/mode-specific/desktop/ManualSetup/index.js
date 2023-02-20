import ProCard from "@ant-design/pro-card";
import React from "react";
// OS Specific Components
import MacProxySettings from "./Mac";

const ManualSetup = () => {
  return (
    <React.Fragment>
      <ProCard className="primary-card github-like-border">
        <MacProxySettings />
      </ProCard>
    </React.Fragment>
  );
};

export default ManualSetup;
