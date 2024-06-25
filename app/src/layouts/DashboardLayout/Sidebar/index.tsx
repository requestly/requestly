import React from "react";
import { PrimarySidebar } from "./PrimarySidebar";
import { isAppTypeSessionBear } from "utils/AppUtils";
import "./Sidebar.css";

export const Sidebar: React.FC = () => {
  if (isAppTypeSessionBear()) return null;

  return (
    <aside className="sidebar-container">
      <PrimarySidebar />
    </aside>
  );
};
