import React from "react";
import { ContentListHeader } from "componentsV2/ContentList";
import { RQBreadcrumb } from "lib/design-system-v2/components";
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
      <RQBreadcrumb />
      <ContentListHeader searchValue={searchValue} setSearchValue={handleSearchValueUpdate} />
    </>
  );
};
