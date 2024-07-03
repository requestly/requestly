import React from "react";
import { ContentListHeader } from "componentsV2/ContentList";
import "./sessionsListContentHeader.scss";
import { Button } from "antd";

interface SessionsListContentHeaderProps {
  searchValue: string;
  handleSearchValueUpdate: (searchValue: string) => void;
}

export const SessionsListContentHeader: React.FC<SessionsListContentHeaderProps> = ({
  searchValue,
  handleSearchValueUpdate,
}) => {
  return (
    <div className="sessions-table-header">
      <div className="sessions-table-breadcrumb">
        <span className="sessions-table-title">Sessions</span>
      </div>
      <ContentListHeader
        searchValue={searchValue}
        setSearchValue={handleSearchValueUpdate}
        actions={[<Button>P1</Button>]}
      />
    </div>
  );
};
