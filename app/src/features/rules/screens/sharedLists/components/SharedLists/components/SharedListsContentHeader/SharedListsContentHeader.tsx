import React from "react";
import { ContentListHeader } from "componentsV2/ContentList";
import "./sharedListsContentHeader.scss";

interface SharedListsContentHeaderProps {
  searchValue: string;
  handleSearchValueUpdate: (value: string) => void;
}

export const SharedListsContentHeader: React.FC<SharedListsContentHeaderProps> = ({
  searchValue,
  handleSearchValueUpdate,
}) => {
  return (
    <div className="sharedlist-table-header">
      <div className="sharedlist-table-breadcrumb">
        <span className="breadcrumb-1">Shared Lists</span> {" > "} <span className="breadcrumb-2">All</span>
      </div>
      <ContentListHeader searchValue={searchValue} setSearchValue={handleSearchValueUpdate} />
    </div>
  );
};
