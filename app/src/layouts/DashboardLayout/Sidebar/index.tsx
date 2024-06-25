import React from "react";
import { PrimarySidebar } from "./PrimarySidebar";
import "./Sidebar.css";

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar-container">
      <PrimarySidebar />
    </aside>
  );
};
