import React from "react";
import { PrimarySidebar } from "./PrimarySidebar";
import { SecondarySidebar } from "./SecondarySidebar";
import "./SidebarV2.css";

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar-container">
      <PrimarySidebar />
      <SecondarySidebar />
    </aside>
  );
};
