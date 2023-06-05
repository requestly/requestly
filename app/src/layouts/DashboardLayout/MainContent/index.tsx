import React from "react";
import { Outlet } from "react-router-dom";
import { SecondarySidebar } from "./SecondarySidebar";
import "./MainContent.css";

export const MainContent: React.FC = () => {
  console.log({ location: window.location.href });

  return (
    <div className="main-content-container">
      MainContent
      {/* secondary sidebar */}
      <SecondarySidebar />
      {/* content */}
      <Outlet />
      {/* docs */}
    </div>
  );
};
