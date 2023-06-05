import React from "react";
import { Outlet } from "react-router-dom";
import { RulesSecondarySidebar } from "./RulesSecondarySidebar";
import "./RulesContainer.css";

export const RulesContainer: React.FC = () => {
  console.log({ location: window.location.href });

  return (
    <div className="rules-container">
      <RulesSecondarySidebar />
      <div className="rules-outlet-container">
        <Outlet />
      </div>
    </div>
  );
};
