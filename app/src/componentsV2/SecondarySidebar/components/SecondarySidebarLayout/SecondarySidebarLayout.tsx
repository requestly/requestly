import React, { ReactNode } from "react";
import "./SecondarySidebarLayout.scss";

interface Props {
  secondarySidebar: ReactNode;
  children: ReactNode;
}

export const SecondarySidebarLayout: React.FC<Props> = ({ secondarySidebar, children }) => {
  return (
    <div className="secondary-sidebar-layout-container">
      {secondarySidebar}
      <div className="secondary-sidebar-content-container">{children}</div>
    </div>
  );
};
