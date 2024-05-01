import React from "react";
import { ContentListHeader } from "componentsV2/ContentList";
import "./sharedListViewerContentHeader.scss";

interface ContentHeaderProps {
  searchValue: string;
  handleSearchValueUpdate: (value: string) => void;
}

export const SharedListsContentHeader: React.FC<ContentHeaderProps> = ({ searchValue, handleSearchValueUpdate }) => {
  return (
    <div className="sharedlist-viewer-table-header">
      <div className="sharedlist-viewer-table-breadcrumb">
        <span className="breadcrumb-1">Rules</span> {" > "} <span className="breadcrumb-2">Shared lists</span> {" > "}
        <span className="breadcrumb-2">Viewer</span>
      </div>
      <ContentListHeader searchValue={searchValue} setSearchValue={handleSearchValueUpdate} />
    </div>
  );
};
