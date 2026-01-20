import React from "react";
import NoSearchFound from "/assets/media/apiClient/empty-search.svg";
import "./tabsEmptyState.scss";

// Empty state component for when no tabs are found in search
export interface TabsEmptyStateProps {
  onClearFilter: () => void;
}

export const TabsEmptyState: React.FC<TabsEmptyStateProps> = ({ onClearFilter }) => {
  return (
    <div className="tabs-empty-state">
      <img src={NoSearchFound} alt="No tabs found" className="tabs-empty-icon" />
      <div className="tabs-empty-text">No tabs found!</div>
      <div className="tabs-clear-filter" onClick={onClearFilter}>
        <span className="clear-icon">✕</span>
        <span className="clear-text">Clear search</span>
      </div>
    </div>
  );
};
