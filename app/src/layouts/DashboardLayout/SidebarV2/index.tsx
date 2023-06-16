import React from "react";
import { PrimarySidebar } from "./PrimarySidebar";
import "./SidebarV2.css";

export const SidebarV: React.FC = () => {
  return (
    <aside className="sidebar-container">
      <PrimarySidebar />
    </aside>
  );
};
