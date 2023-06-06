import React from "react";
import { Outlet } from "react-router-dom";
import { RulesSidebar } from "./RulesSidebar";
import "./RulesContainer.css";

export const RulesContainer: React.FC = () => {
  console.log({ location: window.location.href });

  return (
    <div className="rules-container">
      <RulesSidebar />
      <div className="rules-outlet-container">
        <Outlet />
      </div>
    </div>
  );
};
