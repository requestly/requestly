import React from "react";

import { EnvironmentSwitcher } from "@apiClientV2/modules/Environments";

const Sidebar: React.FC = () => {
  return (
    <div className="flex flex-1 flex-col border-r border-r-neutral-600 bg-surface-0">
      <div className="flex items-center justify-between border-b border-b-neutral-600 p-1">
        <EnvironmentSwitcher />
      </div>
    </div>
  );
};

export default Sidebar;
