import React from "react";
import { ContentListHeader } from "componentsV2/ContentList";
import { RQBreadcrumb } from "lib/design-system-v2/components";
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
      <RQBreadcrumb />
      <ContentListHeader searchValue={searchValue} setSearchValue={handleSearchValueUpdate} />
    </div>
  );
};
