import React from "react";
import { ContentListHeader } from "componentsV2/ContentList";
import "./templatesTableContentHeader.scss";

interface TemplatesTableContentHeaderProps {
  searchValue: string;
  handleSearchValueUpdate: (value: string) => void;
}

export const TemplatesTableContentHeader: React.FC<TemplatesTableContentHeaderProps> = ({
  searchValue,
  handleSearchValueUpdate,
}) => {
  return (
    <>
      <div className="templates-table-breadcrumb">
        <span className="breadcrumb-1">Rules</span> {" > "} <span className="breadcrumb-2">Templates</span>
      </div>
      <ContentListHeader searchValue={searchValue} setSearchValue={handleSearchValueUpdate} />
    </>
  );
};
