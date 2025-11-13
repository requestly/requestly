import React from "react";
import "./tabsSearchContainer.scss";

export const TabsSearchContainer: React.FC = () => {
  return (
    <div className="tabs-search-container">
      <div className="tabs-search-input-wrapper">
        <input type="text" placeholder="Search tabs" className="tabs-search-input" autoComplete="off" />
      </div>
    </div>
  );
};
